using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.BookingService.Data;
using TravelAssistant.Services.BookingService.DTOs.Bookings;
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

    public async Task<(IReadOnlyList<Booking> Items, int Total)> SearchAsync(
        BookingSearchRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = BuildQuery(request);
        var total = await query.CountAsync(cancellationToken);
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = Math.Clamp(request.PageSize, 1, 100);
        var sorted = ApplySort(query, request.SortBy, request.SortOrder);
        var items = await sorted
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
        return (items, total);
    }

    public async Task<IReadOnlyList<Booking>> ListForExportAsync(
        BookingSearchRequest request,
        int maxRows,
        CancellationToken cancellationToken = default)
    {
        var query = BuildQuery(request);
        var sorted = ApplySort(query, request.SortBy, request.SortOrder);
        var list = await sorted.AsNoTracking().Take(Math.Clamp(maxRows, 1, 10_000)).ToListAsync(cancellationToken);
        return list;
    }

    private IQueryable<Booking> BuildQuery(BookingSearchRequest request)
    {
        var query = _dbContext.Bookings.AsQueryable();

        if (request.UserId.HasValue)
            query = query.Where(x => x.UserId == request.UserId.Value);

        if (!string.IsNullOrWhiteSpace(request.Q))
        {
            var q = request.Q.Trim();
            query = query.Where(x =>
                x.ReferenceCode.Contains(q) ||
                x.Provider.Contains(q) ||
                x.BookingType.Contains(q) ||
                x.Status.Contains(q));
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
            query = query.Where(x => x.Status == request.Status.Trim());

        if (!string.IsNullOrWhiteSpace(request.Provider))
        {
            var p = request.Provider.Trim();
            query = query.Where(x => x.Provider.Contains(p));
        }

        if (request.BookingDateFrom.HasValue)
            query = query.Where(x => x.BookingDate >= request.BookingDateFrom.Value);

        if (request.BookingDateTo.HasValue)
            query = query.Where(x => x.BookingDate <= request.BookingDateTo.Value);

        return query;
    }

    private static IQueryable<Booking> ApplySort(IQueryable<Booking> query, string? sortBy, string? sortOrder)
    {
        var descending = !string.Equals(sortOrder, "asc", StringComparison.OrdinalIgnoreCase);
        return (sortBy?.Trim().ToLowerInvariant()) switch
        {
            "status" => descending
                ? query.OrderByDescending(x => x.Status).ThenByDescending(x => x.Id)
                : query.OrderBy(x => x.Status).ThenBy(x => x.Id),
            "provider" => descending
                ? query.OrderByDescending(x => x.Provider).ThenByDescending(x => x.Id)
                : query.OrderBy(x => x.Provider).ThenBy(x => x.Id),
            "amount" => descending
                ? query.OrderByDescending(x => x.Amount).ThenByDescending(x => x.Id)
                : query.OrderBy(x => x.Amount).ThenBy(x => x.Id),
            _ => descending
                ? query.OrderByDescending(x => x.BookingDate).ThenByDescending(x => x.Id)
                : query.OrderBy(x => x.BookingDate).ThenBy(x => x.Id)
        };
    }
}
