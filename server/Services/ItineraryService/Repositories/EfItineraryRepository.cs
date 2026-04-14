using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.ItineraryService.Data;
using TravelAssistant.Services.ItineraryService.Models.Entities;

namespace TravelAssistant.Services.ItineraryService.Repositories;

public sealed class EfItineraryRepository : IItineraryRepository
{
    private readonly ApplicationDbContext _dbContext;

    public EfItineraryRepository(ApplicationDbContext dbContext) => _dbContext = dbContext;

    public async Task<Itinerary?> GetWithDaysAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Itineraries
            .AsNoTracking()
            .Include(x => x.Days)
            .ThenInclude(d => d.Activities)
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Itinerary>> ListForUserAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Itineraries
            .AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.StartDate)
            .ToListAsync(cancellationToken);
    }

    public Task AddAsync(Itinerary itinerary, CancellationToken cancellationToken = default)
    {
        _dbContext.Itineraries.Add(itinerary);
        return Task.CompletedTask;
    }

    public Task UpdateAsync(Itinerary itinerary, CancellationToken cancellationToken = default)
    {
        _dbContext.Itineraries.Update(itinerary);
        return Task.CompletedTask;
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default) =>
        _dbContext.SaveChangesAsync(cancellationToken);
}
