using Microsoft.AspNetCore.SignalR;
using SmartTravelAssistant.API.Hubs;
using SmartTravelAssistant.API.Services.Interfaces;

namespace SmartTravelAssistant.API.Services.Auth;

public sealed class RealtimeNotificationService : IRealtimeNotificationService
{
    private readonly IHubContext<NotificationsHub> _hubContext;

    public RealtimeNotificationService(IHubContext<NotificationsHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public Task BroadcastTravelUpdateAsync(string title, string message, string type, CancellationToken cancellationToken = default)
    {
        return _hubContext.Clients.All.SendAsync(
            "travelUpdate",
            new
            {
                title,
                message,
                type,
                sentAtUtc = DateTime.UtcNow
            },
            cancellationToken);
    }
}
