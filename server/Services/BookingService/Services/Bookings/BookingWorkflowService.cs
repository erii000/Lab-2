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
        await _travelUpdatePublisher.BroadcastAsync(
            "New booking",
            $"Booking {booking.ReferenceCode} created",
            "booking",
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
        await _travelUpdatePublisher.NotifyUserAsync(
            entity.UserId,
            "Booking confirmed",
            $"Your booking {entity.ReferenceCode} is confirmed.",
            "booking",
            cancellationToken);
        await _travelUpdatePublisher.BroadcastAsync(
            "Booking paid",
            $"Booking {entity.ReferenceCode} confirmed — refresh dashboard.",
            "booking",
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
        await _travelUpdatePublisher.BroadcastAsync(
            "Booking status changed",
            $"Booking {entity.Id} → {trimmed}",
            "booking",
            cancellationToken);
        return new BookingStatusPatchResult(Map(entity), NotFound: false, InvalidTransition: false);
    }

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
