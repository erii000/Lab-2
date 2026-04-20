using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.NotificationService.Contracts.Notifications;
using TravelAssistant.Services.NotificationService.Data;
using TravelAssistant.Services.NotificationService.Interfaces;
using TravelAssistant.Services.NotificationService.Models;

namespace TravelAssistant.Services.NotificationService.Services
{
    public sealed class NotificationService : INotificationService
    {
        private readonly ApplicationDbContext _context;

        public NotificationService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Notification>> GetAllAsync(CancellationToken cancellationToken = default)
        {
            return await _context.Notifications
                .AsNoTracking()
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<Notification?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
        {
            return await _context.Notifications
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        }

        public async Task<IEnumerable<Notification>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default)
        {
            return await _context.Notifications
                .AsNoTracking()
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<PagedResult<Notification>> SearchAsync(NotificationSearchRequest request, CancellationToken cancellationToken = default)
        {
            var page = request.Page < 1 ? 1 : request.Page;
            var pageSize = request.PageSize switch
            {
                < 1 => 20,
                > 100 => 100,
                _ => request.PageSize
            };

            IQueryable<Notification> query = _context.Notifications.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(request.Q))
            {
                var search = request.Q.Trim();
                query = query.Where(x =>
                    x.Title.Contains(search) ||
                    x.Message.Contains(search) ||
                    x.Type.Contains(search));
            }

            if (!string.IsNullOrWhiteSpace(request.Type))
            {
                var type = request.Type.Trim();
                query = query.Where(x => x.Type == type);
            }

            if (request.IsRead.HasValue)
            {
                query = query.Where(x => x.IsRead == request.IsRead.Value);
            }

            if (request.UserId.HasValue)
            {
                query = query.Where(x => x.UserId == request.UserId.Value);
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
                "title" => descending ? query.OrderByDescending(x => x.Title) : query.OrderBy(x => x.Title),
                "type" => descending ? query.OrderByDescending(x => x.Type) : query.OrderBy(x => x.Type),
                "isread" => descending ? query.OrderByDescending(x => x.IsRead) : query.OrderBy(x => x.IsRead),
                _ => descending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt)
            };

            var totalCount = await query.CountAsync(cancellationToken);
            var items = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            return new PagedResult<Notification>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = totalCount == 0 ? 0 : (int)Math.Ceiling(totalCount / (double)pageSize)
            };
        }

        public async Task<Notification?> MarkAsReadAsync(int id, CancellationToken cancellationToken = default)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

            if (notification == null) return null;

            notification.IsRead = true;
            await _context.SaveChangesAsync(cancellationToken);
            return notification;
        }

        public async Task<Notification> CreateAsync(Notification notification, CancellationToken cancellationToken = default)
        {
            if (notification.CreatedAt == default)
            {
                notification.CreatedAt = DateTime.UtcNow;
            }

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync(cancellationToken);
            return notification;
        }
    }
}
