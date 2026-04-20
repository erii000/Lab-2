using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace TravelAssistant.Services.RealTimeCommunicationService.Hubs;

[Authorize]
public sealed class NotificationsHub : Hub
{
    public const string TravelUpdateEventName = "travelUpdate";
}

