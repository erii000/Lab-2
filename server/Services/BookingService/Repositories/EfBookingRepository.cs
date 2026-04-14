using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.BookingService.Data;
using TravelAssistant.Services.BookingService.Models.Entities;

namespace TravelAssistant.Services.BookingService.Repositories;

public sealed class EfBookingRepository : IBookingRepository
{
    private readonly ApplicationDbContext _dbContext;

    public EfBookingRepository(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public Task<Booking?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        _dbContext.Bookings.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public Task AddAsync(Booking booking, CancellationToken cancellationToken = default)
    {
        _dbContext.Bookings.Add(booking);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        _dbContext.SaveChangesAsync(cancellationToken);
}
