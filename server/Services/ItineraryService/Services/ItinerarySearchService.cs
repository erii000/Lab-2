using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.ItineraryService.Contracts.Itineraries;
using TravelAssistant.Services.ItineraryService.Data;
using TravelAssistant.Services.ItineraryService.Services.Interfaces;

namespace TravelAssistant.Services.ItineraryService.Services;

public sealed class ItinerarySearchService : IItinerarySearchService
{
    private readonly ApplicationDbContext _dbContext;

    public ItinerarySearchService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PagedResult<ItinerarySearchItemResponse>> SearchAsync(ItinerarySearchRequest request, CancellationToken cancellationToken = default)
    {
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize switch
        {
            < 1 => 20,
            > 100 => 100,
            _ => request.PageSize
        };

        IQueryable<Models.Entities.Trip> query = _dbContext.Trips
            .AsNoTracking()
            .Include(x => x.TripDestinations)
                .ThenInclude(x => x.Destination);

        if (!string.IsNullOrWhiteSpace(request.Q))
        {
            var search = request.Q.Trim();
            query = query.Where(x =>
                x.Title.Contains(search) ||
                x.Status.Contains(search) ||
                x.TripDestinations.Any(td =>
                    td.Destination != null &&
                    (td.Destination.Name.Contains(search) ||
                     td.Destination.City.Contains(search) ||
                     td.Destination.Country.Contains(search))));
        }

        if (!string.IsNullOrWhiteSpace(request.Destination))
        {
            var destination = request.Destination.Trim();
            query = query.Where(x => x.TripDestinations.Any(td =>
                td.Destination != null &&
                (td.Destination.Name.Contains(destination) ||
                 td.Destination.City.Contains(destination) ||
                 td.Destination.Country.Contains(destination))));
        }

        if (!string.IsNullOrWhiteSpace(request.Status))
        {
            var status = request.Status.Trim();
            query = query.Where(x => x.Status == status);
        }

        if (request.UserId.HasValue)
        {
            query = query.Where(x => x.UserId == request.UserId.Value);
        }

        if (request.StartFrom.HasValue)
        {
            query = query.Where(x => x.StartDate >= request.StartFrom.Value);
        }

        if (request.EndTo.HasValue)
        {
            query = query.Where(x => x.EndDate <= request.EndTo.Value);
        }

        var sortBy = request.SortBy?.Trim().ToLowerInvariant() ?? "startdate";
        var descending = !string.Equals(request.SortOrder, "asc", StringComparison.OrdinalIgnoreCase);

        query = sortBy switch
        {
            "title" => descending ? query.OrderByDescending(x => x.Title) : query.OrderBy(x => x.Title),
            "status" => descending ? query.OrderByDescending(x => x.Status) : query.OrderBy(x => x.Status),
            "enddate" => descending ? query.OrderByDescending(x => x.EndDate) : query.OrderBy(x => x.EndDate),
            "createdat" => descending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt),
            _ => descending ? query.OrderByDescending(x => x.StartDate) : query.OrderBy(x => x.StartDate)
        };

        var totalCount = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new ItinerarySearchItemResponse
            {
                Id = x.Id,
                UserId = x.UserId,
                Title = x.Title,
                Status = x.Status,
                StartDate = x.StartDate,
                EndDate = x.EndDate,
                Budget = x.Budget,
                Destinations = x.TripDestinations
                    .Where(td => td.Destination != null)
                    .Select(td => td.Destination!.Name)
                    .Distinct()
                    .ToList()
            })
            .ToListAsync(cancellationToken);

        return new PagedResult<ItinerarySearchItemResponse>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize)
        };
    }
}
