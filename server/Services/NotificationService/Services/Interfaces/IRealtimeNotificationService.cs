namespace TravelAssistant.Services.NotificationService.Services.Interfaces;

public interface IRealtimeNotificationService
{
    Task BroadcastTravelUpdateAsync(
        string title,
        string message,
        string type,
        int? bookingId = null,
        string? travelerName = null,
        string? destination = null,
        int? targetUserId = null,
        CancellationToken cancellationToken = default);

    Task SendUserTravelUpdateAsync(
        int userId,
        string title,
        string message,
        string type,
        int? bookingId = null,
        string? travelerName = null,
        string? destination = null,
        int? targetUserId = null,
        CancellationToken cancellationToken = default);
}
