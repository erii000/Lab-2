using TravelAssistant.Services.NotificationService.Models;

namespace TravelAssistant.Services.NotificationService.Interfaces
{
    public interface INotificationService
    {
        Task<IEnumerable<Notification>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<Notification>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default);
        Task<Notification?> MarkAsReadAsync(int id, CancellationToken cancellationToken = default);
        Task<Notification> CreateAsync(Notification notification, CancellationToken cancellationToken = default);
    }
}