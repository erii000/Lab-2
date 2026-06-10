using System.Text.Json;
using TravelAssistant.Common.Audit;
using TravelAssistant.Common.Notifications;
using TravelAssistant.Services.BookingService.Domain;
using TravelAssistant.Services.BookingService.DTOs.Bookings;
using TravelAssistant.Services.BookingService.Models.Entities;
using TravelAssistant.Services.BookingService.Repositories;

namespace TravelAssistant.Services.BookingService.Services.Bookings;

public sealed class BookingWorkflowService : IBookingWorkflowService
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IAuditWriter _auditWriter;
    private readonly ITravelUpdatePublisher _travelUpdatePublisher;

    public BookingWorkflowService(
        IBookingRepository bookingRepository,
        IAuditWriter auditWriter,
        ITravelUpdatePublisher travelUpdatePublisher)
    {
        _bookingRepository = bookingRepository;
        _auditWriter = auditWriter;
        _travelUpdatePublisher = travelUpdatePublisher;
    }

    public async Task<Booking> CreateAsync(int userId, CreateBookingRequest request, CancellationToken cancellationToken = default)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var booking = new Booking
        {
            UserId = userId,
            ItineraryId = request.ItineraryId,
            BookingType = request.BookingType.Trim(),
            Provider = request.Provider.Trim(),
            ReferenceCode = request.ReferenceCode.Trim(),
            Amount = request.Amount,
            Currency = string.IsNullOrWhiteSpace(request.Currency) ? null : request.Currency.Trim().ToUpperInvariant(),
            BookingDate = today,
            Status = "Pending",
            MetadataJson = string.IsNullOrWhiteSpace(request.MetadataJson) ? null : request.MetadataJson,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _bookingRepository.AddAsync(booking, cancellationToken);
        await _bookingRepository.SaveChangesAsync(cancellationToken);
        await _auditWriter.WriteAsync(userId, "Create", "Booking", $"Booking {booking.Id} {booking.ReferenceCode}", cancellationToken);
        var (destination, travelerName) = ParseBookingMeta(booking);
        await _travelUpdatePublisher.BroadcastAsync(
            "New booking draft",
            $"{LabelTraveler(travelerName, userId)} started booking {destination} ({booking.ReferenceCode})",
            "booking",
            new TravelUpdateContext { BookingId = booking.Id, TravelerName = travelerName, Destination = destination },
            cancellationToken);
        return booking;
    }

    public async Task<BookingDetailResponse?> GetAsync(int bookingId, int requestingUserId, bool isAdmin, CancellationToken cancellationToken = default)
    {
        var entity = await _bookingRepository.GetByIdAsync(bookingId, cancellationToken);
        if (entity is null)
            return null;

        if (!isAdmin && entity.UserId != requestingUserId)
            return null;

        return Map(entity);
    }

    public async Task<BookingDetailResponse?> UpdateAsync(
        int bookingId,
        int requestingUserId,
        bool isAdmin,
        UpdateBookingRequest request,
        CancellationToken cancellationToken = default)
    {
        var entity = await _bookingRepository.GetByIdAsync(bookingId, cancellationToken);
        if (entity is null)
            return null;

        if (!isAdmin && entity.UserId != requestingUserId)
            return null;

        if (request.ItineraryId.HasValue)
            entity.ItineraryId = request.ItineraryId;
        if (request.Amount.HasValue)
            entity.Amount = request.Amount;
        if (!string.IsNullOrWhiteSpace(request.Currency))
            entity.Currency = request.Currency.Trim().ToUpperInvariant();
        if (request.MetadataJson is not null)
            entity.MetadataJson = string.IsNullOrWhiteSpace(request.MetadataJson) ? null : request.MetadataJson;

        entity.UpdatedAt = DateTime.UtcNow;
        await _bookingRepository.SaveChangesAsync(cancellationToken);
        return Map(entity);
    }

    public async Task<BookingDetailResponse?> ConfirmPaymentAsync(
        int bookingId,
        int requestingUserId,
        CancellationToken cancellationToken = default)
    {
        var entity = await _bookingRepository.GetByIdAsync(bookingId, cancellationToken);
        if (entity is null || entity.UserId != requestingUserId)
            return null;

        if (!BookingStatusTransitions.IsAllowed(entity.Status, "Confirmed"))
            return Map(entity);

        entity.Status = "Confirmed";
        entity.UpdatedAt = DateTime.UtcNow;
        await _bookingRepository.SaveChangesAsync(cancellationToken);
        await _auditWriter.WriteAsync(requestingUserId, "ConfirmPayment", "Booking", $"Booking {entity.Id} confirmed", cancellationToken);

        var (destination, travelerName) = ParseBookingMeta(entity);
        var amountLabel = entity.Amount.HasValue
            ? $"€{entity.Amount:0} {entity.Currency ?? "EUR"}"
            : "paid";

        var context = new TravelUpdateContext
        {
            BookingId = entity.Id,
            TravelerName = travelerName,
            Destination = destination,
        };

        await _travelUpdatePublisher.NotifyUserAsync(
            entity.UserId,
            "Booking confirmed",
            $"Your trip to {destination} is confirmed. Reference {entity.ReferenceCode}.",
            "booking",
            context,
            cancellationToken);
        await _travelUpdatePublisher.BroadcastAsync(
            "New paid booking",
            $"{LabelTraveler(travelerName, entity.UserId)} paid for {destination} — BK-{entity.Id} · {amountLabel}",
            "booking",
            context,
            cancellationToken);
        return Map(entity);
    }

    public async Task<BookingDetailResponse?> DiscardAsync(
        int bookingId,
        int requestingUserId,
        CancellationToken cancellationToken = default)
    {
        var entity = await _bookingRepository.GetByIdAsync(bookingId, cancellationToken);
        if (entity is null || entity.UserId != requestingUserId)
            return null;

        if (!string.Equals(entity.Status, "Pending", StringComparison.OrdinalIgnoreCase))
            return Map(entity);

        if (!BookingStatusTransitions.IsAllowed(entity.Status, "Cancelled"))
            return Map(entity);

        entity.Status = "Cancelled";
        entity.UpdatedAt = DateTime.UtcNow;
        await _bookingRepository.SaveChangesAsync(cancellationToken);
        return Map(entity);
    }

    public async Task<BookingStatusPatchResult> TryUpdateStatusAsync(int bookingId, string nextStatus, CancellationToken cancellationToken = default)
    {
        var entity = await _bookingRepository.GetByIdAsync(bookingId, cancellationToken);
        if (entity is null)
            return new BookingStatusPatchResult(null, NotFound: true, InvalidTransition: false);

        var trimmed = nextStatus.Trim();
        if (!BookingStatusTransitions.IsAllowed(entity.Status, trimmed))
            return new BookingStatusPatchResult(Map(entity), NotFound: false, InvalidTransition: true);

        entity.Status = trimmed;
        entity.UpdatedAt = DateTime.UtcNow;
        await _bookingRepository.SaveChangesAsync(cancellationToken);
        var (destination, travelerName) = ParseBookingMeta(entity);
        var context = new TravelUpdateContext
        {
            BookingId = entity.Id,
            TravelerName = travelerName,
            Destination = destination,
        };

        var (userTitle, userMessage) = UserStatusNotification(trimmed, destination, entity.ReferenceCode);
        await _travelUpdatePublisher.NotifyUserAsync(
            entity.UserId,
            userTitle,
            userMessage,
            "booking",
            context,
            cancellationToken);
        await _travelUpdatePublisher.BroadcastAsync(
            AdminStatusTitle(trimmed),
            $"{LabelTraveler(travelerName, entity.UserId)} · {destination} (BK-{entity.Id}) → {trimmed}",
            "booking",
            context,
            cancellationToken);
        return new BookingStatusPatchResult(Map(entity), NotFound: false, InvalidTransition: false);
    }

    private static string AdminStatusTitle(string status) =>
        status.Equals("Refunded", StringComparison.OrdinalIgnoreCase) ||
        status.Equals("PartiallyRefunded", StringComparison.OrdinalIgnoreCase)
            ? "Refund processed"
            : "Booking status changed";

    private static (string Title, string Message) UserStatusNotification(string status, string destination, string referenceCode)
    {
        var place = string.IsNullOrWhiteSpace(destination) ? "your trip" : destination;
        var reference = string.IsNullOrWhiteSpace(referenceCode) ? "" : $" Reference {referenceCode.Trim()}.";

        if (status.Equals("Refunded", StringComparison.OrdinalIgnoreCase))
            return ("Booking refunded", $"Your booking for {place} has been fully refunded.{reference}");

        if (status.Equals("PartiallyRefunded", StringComparison.OrdinalIgnoreCase))
            return ("Partial refund issued", $"A partial refund was processed for your trip to {place}.{reference}");

        if (status.Equals("Cancelled", StringComparison.OrdinalIgnoreCase))
            return ("Booking cancelled", $"Your booking for {place} has been cancelled.{reference} If a refund was issued, it will appear on your original payment method within 5–10 business days.");

        if (status.Equals("Completed", StringComparison.OrdinalIgnoreCase))
            return ("Trip completed", $"Your trip to {place} is marked complete.{reference} We hope you had a great journey!");

        return ("Booking update", $"Your booking for {place} is now {status}.{reference}");
    }

    private static (string Destination, string TravelerName) ParseBookingMeta(Booking booking)
    {
        var destination = booking.BookingType;
        var travelerName = "";

        if (string.IsNullOrWhiteSpace(booking.MetadataJson))
            return (destination, travelerName);

        try
        {
            using var doc = JsonDocument.Parse(booking.MetadataJson);
            var root = doc.RootElement;
            if (root.TryGetProperty("destinationTitle", out var destEl))
            {
                var parsed = destEl.GetString();
                if (!string.IsNullOrWhiteSpace(parsed))
                    destination = parsed!;
            }

            if (root.TryGetProperty("traveler", out var travelerEl) &&
                travelerEl.TryGetProperty("fullName", out var nameEl))
            {
                travelerName = nameEl.GetString()?.Trim() ?? "";
            }
        }
        catch
        {
            /* keep defaults */
        }

        return (destination, travelerName);
    }

    private static string LabelTraveler(string travelerName, int userId) =>
        string.IsNullOrWhiteSpace(travelerName) ? $"User #{userId}" : travelerName;

    private static BookingDetailResponse Map(Booking b) =>
        new()
        {
            Id = b.Id,
            UserId = b.UserId,
            ItineraryId = b.ItineraryId,
            Provider = b.Provider,
            BookingType = b.BookingType,
            ReferenceCode = b.ReferenceCode,
            Amount = b.Amount,
            Currency = b.Currency,
            BookingDate = b.BookingDate,
            Status = b.Status,
            MetadataJson = b.MetadataJson
        };
}
