namespace TravelAssistant.Services.NotificationService.Services.Interfaces;

public interface IRealtimeNotificationService
{
    Task BroadcastTravelUpdateAsync(string title, string message, string type, CancellationToken cancellationToken = default);
    Task SendUserTravelUpdateAsync(int userId, string title, string message, string type, CancellationToken cancellationToken = default);
}
