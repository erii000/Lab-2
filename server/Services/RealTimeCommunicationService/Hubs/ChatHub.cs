using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace TravelAssistant.Services.RealTimeCommunicationService.Hubs;

[Authorize]
public sealed class ChatHub : Hub
{
    public const string NewMessageEventName = "chatMessage";
}
