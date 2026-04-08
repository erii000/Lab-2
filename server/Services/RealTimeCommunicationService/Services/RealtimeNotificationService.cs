using Microsoft.AspNetCore.SignalR;
using TravelAssistant.Services.RealTimeCommunicationService.Hubs;
using TravelAssistant.Services.RealTimeCommunicationService.Services.Interfaces;

namespace TravelAssistant.Services.RealTimeCommunicationService.Services;

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


