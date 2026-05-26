using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.NotificationService.Contracts.Notifications;
using TravelAssistant.Services.NotificationService.Data;
using TravelAssistant.Services.NotificationService.Models;

namespace TravelAssistant.Services.NotificationService.Repositories;

public sealed class EfNotificationRepository : INotificationRepository
{
    private readonly ApplicationDbContext _context;

    public EfNotificationRepository(ApplicationDbContext context) => _context = context;

    public async Task<IReadOnlyList<Notification>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _context.Notifications.AsNoTracking().OrderByDescending(x => x.CreatedAt).ToListAsync(cancellationToken);

    public Task<Notification?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        _context.Notifications.AsNoTracking().FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

    public async Task<IReadOnlyList<Notification>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default) =>
        await _context.Notifications.AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync(cancellationToken);

    public async Task<(IReadOnlyList<Notification> Items, int Total)> SearchAsync(
        NotificationSearchRequest request,
        CancellationToken cancellationToken = default)
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
            query = query.Where(x => x.Type == request.Type.Trim());

        if (request.IsRead.HasValue)
            query = query.Where(x => x.IsRead == request.IsRead.Value);

        if (request.UserId.HasValue)
            query = query.Where(x => x.UserId == request.UserId.Value);

        if (request.CreatedFromUtc.HasValue)
            query = query.Where(x => x.CreatedAt >= request.CreatedFromUtc.Value);

        if (request.CreatedToUtc.HasValue)
            query = query.Where(x => x.CreatedAt <= request.CreatedToUtc.Value);

        var sortBy = request.SortBy?.Trim().ToLowerInvariant() ?? "createdat";
        var descending = !string.Equals(request.SortOrder, "asc", StringComparison.OrdinalIgnoreCase);
        query = sortBy switch
        {
            "title" => descending ? query.OrderByDescending(x => x.Title) : query.OrderBy(x => x.Title),
            "type" => descending ? query.OrderByDescending(x => x.Type) : query.OrderBy(x => x.Type),
            "isread" => descending ? query.OrderByDescending(x => x.IsRead) : query.OrderBy(x => x.IsRead),
            _ => descending ? query.OrderByDescending(x => x.CreatedAt) : query.OrderBy(x => x.CreatedAt)
        };

        var total = await query.CountAsync(cancellationToken);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(cancellationToken);
        return (items, total);
    }

    public async Task<Notification> AddAsync(Notification notification, CancellationToken cancellationToken = default)
    {
        if (notification.CreatedAt == default)
            notification.CreatedAt = DateTime.UtcNow;

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync(cancellationToken);
        return notification;
    }

    public async Task<Notification?> MarkAsReadAsync(int id, CancellationToken cancellationToken = default)
    {
        var notification = await _context.Notifications.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
        if (notification is null)
            return null;

        notification.IsRead = true;
        await _context.SaveChangesAsync(cancellationToken);
        return notification;
    }
}
