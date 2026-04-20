using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.AuditService.Contracts.AuditLogs;
using TravelAssistant.Services.AuditService.Data;
using TravelAssistant.Services.AuditService.Interfaces;
using TravelAssistant.Services.AuditService.Models;

namespace TravelAssistant.Services.AuditService.Services
{
    public sealed class AuditLogService : IAuditLogService
    {
        private readonly ApplicationDbContext _context;

        public AuditLogService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<AuditLog>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.AuditLogs
                .AsNoTracking()
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<PagedResult<AuditLog>> SearchAsync(AuditLogSearchRequest request, CancellationToken cancellationToken = default)
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
            {
                query = query.Where(x => x.UserId == request.UserId.Value);
            }

            if (!string.IsNullOrWhiteSpace(request.EntityName))
            {
                var entityName = request.EntityName.Trim();
                query = query.Where(x => x.EntityName == entityName);
            }

            if (!string.IsNullOrWhiteSpace(request.Action))
            {
                var action = request.Action.Trim();
                query = query.Where(x => x.Action == action);
            }

            if (request.CreatedFromUtc.HasValue)
            {
                query = query.Where(x => x.CreatedAt >= request.CreatedFromUtc.Value);
            }

            if (request.CreatedToUtc.HasValue)
            {
                query = query.Where(x => x.CreatedAt <= request.CreatedToUtc.Value);
            }

            var sortBy = request.SortBy?.Trim().ToLowerInvariant() ?? "createdat";
            var descending = !string.Equals(request.SortOrder, "asc", StringComparison.OrdinalIgnoreCase);

            query = sortBy switch
            {
                "action" => descending ? query.OrderByDescending(x => x.Action) : query.OrderBy(x => x.Action),
                "entityname" => descending ? query.OrderByDescending(x => x.EntityName) : query.OrderBy(x => x.EntityName),
                "userid" => descending ? query.OrderByDescending(x => x.UserId) : query.OrderBy(x => x.UserId),
                _ => descending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt)
            };

            var totalCount = await query.CountAsync(cancellationToken);
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return new PagedResult<AuditLog>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize)
            };
        }

        public async Task<AuditLog> CreateAsync(AuditLog auditLog, CancellationToken cancellationToken = default)
        {
            if (auditLog.CreatedAt == default)
            {
                auditLog.CreatedAt = DateTime.UtcNow;
            }

            _context.AuditLogs.Add(auditLog);
            await _context.SaveChangesAsync(cancellationToken);
            return auditLog;
        }
    }
}
