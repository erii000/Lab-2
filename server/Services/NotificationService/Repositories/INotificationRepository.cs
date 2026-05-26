using TravelAssistant.Services.NotificationService.Contracts.Notifications;
using TravelAssistant.Services.NotificationService.Models;

namespace TravelAssistant.Services.NotificationService.Repositories;

public interface INotificationRepository
{
    Task<IReadOnlyList<Notification>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Notification?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Notification>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<Notification> Items, int Total)> SearchAsync(NotificationSearchRequest request, CancellationToken cancellationToken = default);
    Task<Notification> AddAsync(Notification notification, CancellationToken cancellationToken = default);
    Task<Notification?> MarkAsReadAsync(int id, CancellationToken cancellationToken = default);
}
