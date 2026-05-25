using TravelAssistant.Services.BookingService.Domain;
using TravelAssistant.Services.BookingService.DTOs.Bookings;
using TravelAssistant.Services.BookingService.Models.Entities;
using TravelAssistant.Services.BookingService.Repositories;

namespace TravelAssistant.Services.BookingService.Services.Bookings;

public sealed class BookingWorkflowService : IBookingWorkflowService
{
    private readonly IBookingRepository _bookingRepository;

    public BookingWorkflowService(IBookingRepository bookingRepository) => _bookingRepository = bookingRepository;

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
