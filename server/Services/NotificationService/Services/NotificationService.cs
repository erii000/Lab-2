using Microsoft.EntityFrameworkCore;
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
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<IEnumerable<Notification>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default)
        {
            return await _context.Notifications
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync(cancellationToken);
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
            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync(cancellationToken);
            return notification;
        }
    }
}