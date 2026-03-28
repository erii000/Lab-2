using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace SmartTravelAssistant.API.Hubs;

[Authorize]
public sealed class NotificationsHub : Hub
{
}
