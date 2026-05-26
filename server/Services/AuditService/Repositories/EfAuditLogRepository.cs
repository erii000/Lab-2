using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.AuditService.Contracts.AuditLogs;
using TravelAssistant.Services.AuditService.Data;
using TravelAssistant.Services.AuditService.Models;

namespace TravelAssistant.Services.AuditService.Repositories;

public sealed class EfAuditLogRepository : IAuditLogRepository
{
    private readonly ApplicationDbContext _context;

    public EfAuditLogRepository(ApplicationDbContext context) => _context = context;

    public async Task<IReadOnlyList<AuditLog>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _context.AuditLogs.AsNoTracking().OrderByDescending(x => x.CreatedAt).ToListAsync(cancellationToken);

    public async Task<(IReadOnlyList<AuditLog> Items, int Total)> SearchAsync(
        AuditLogSearchRequest request,
        CancellationToken cancellationToken = default)
    {
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize switch
        {
            < 1 => 20,
            > 100 => 100,
            _ => request.PageSize
        };

        IQueryable<AuditLog> query = _context.AuditLogs.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(request.Q))
        {
            var search = request.Q.Trim();
            query = query.Where(x =>
                x.Action.Contains(search) ||
                x.EntityName.Contains(search) ||
                x.Details.Contains(search));
        }

        if (request.UserId.HasValue)
            query = query.Where(x => x.UserId == request.UserId);

        if (!string.IsNullOrWhiteSpace(request.EntityName))
            query = query.Where(x => x.EntityName == request.EntityName.Trim());

        if (!string.IsNullOrWhiteSpace(request.Action))
            query = query.Where(x => x.Action == request.Action.Trim());

        if (request.CreatedFromUtc.HasValue)
            query = query.Where(x => x.CreatedAt >= request.CreatedFromUtc);

        if (request.CreatedToUtc.HasValue)
            query = query.Where(x => x.CreatedAt <= request.CreatedToUtc);

        var sortBy = request.SortBy?.Trim().ToLowerInvariant() ?? "createdat";
        var descending = !string.Equals(request.SortOrder, "asc", StringComparison.OrdinalIgnoreCase);
        query = sortBy switch
        {
            "action" => descending ? query.OrderByDescending(x => x.Action) : query.OrderBy(x => x.Action),
            "entityname" => descending ? query.OrderByDescending(x => x.EntityName) : query.OrderBy(x => x.EntityName),
            "userid" => descending ? query.OrderByDescending(x => x.UserId) : query.OrderBy(x => x.UserId),
            _ => descending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt)
        };

        var total = await query.CountAsync(cancellationToken);
        var items = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return (items, total);
    }

    public async Task<AuditLog> AddAsync(AuditLog auditLog, CancellationToken cancellationToken = default)
    {
        if (auditLog.CreatedAt == default)
            auditLog.CreatedAt = DateTime.UtcNow;

        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync(cancellationToken);
        return auditLog;
    }
}
