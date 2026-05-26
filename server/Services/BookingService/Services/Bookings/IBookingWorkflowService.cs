using TravelAssistant.Services.BookingService.DTOs.Bookings;
using TravelAssistant.Services.BookingService.Models.Entities;

namespace TravelAssistant.Services.BookingService.Services.Bookings;

public interface IBookingWorkflowService
{
    Task<Booking> CreateAsync(int userId, CreateBookingRequest request, CancellationToken cancellationToken = default);
    Task<BookingDetailResponse?> GetAsync(int bookingId, int requestingUserId, bool isAdmin, CancellationToken cancellationToken = default);
    Task<BookingStatusPatchResult> TryUpdateStatusAsync(int bookingId, string nextStatus, CancellationToken cancellationToken = default);

    Task<BookingDetailResponse?> UpdateAsync(
        int bookingId,
        int requestingUserId,
        bool isAdmin,
        UpdateBookingRequest request,
        CancellationToken cancellationToken = default);

    Task<BookingDetailResponse?> ConfirmPaymentAsync(
        int bookingId,
        int requestingUserId,
        CancellationToken cancellationToken = default);

    /// <summary>Owner discards a pending draft (sets status to Cancelled).</summary>
    Task<BookingDetailResponse?> DiscardAsync(
        int bookingId,
        int requestingUserId,
        CancellationToken cancellationToken = default);
}

public sealed record BookingStatusPatchResult(
    BookingDetailResponse? Data,
    bool NotFound,
    bool InvalidTransition);
