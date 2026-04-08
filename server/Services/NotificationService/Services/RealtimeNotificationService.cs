using TravelAssistant.Services.NotificationService.Services.Interfaces;

namespace TravelAssistant.Services.NotificationService.Services;

public sealed class RealtimeNotificationService : IRealtimeNotificationService
{
    public Task BroadcastTravelUpdateAsync(string title, string message, string type, CancellationToken cancellationToken = default)
    {
        return Task.CompletedTask;
    }
}
