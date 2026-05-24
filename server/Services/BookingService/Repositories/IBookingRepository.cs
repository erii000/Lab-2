using TravelAssistant.Services.BookingService.DTOs.Bookings;
using TravelAssistant.Services.BookingService.Models.Entities;

namespace TravelAssistant.Services.BookingService.Repositories;

public interface IBookingRepository
{
    Task<Booking?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task AddAsync(Booking booking, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Booking> Items, int Total)> SearchAsync(BookingSearchRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Booking>> ListForExportAsync(BookingSearchRequest request, int maxRows, CancellationToken cancellationToken = default);
}
