using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace TravelAssistant.Services.RealTimeCommunicationService.Hubs;

[Authorize]
public sealed class ChatHub : Hub
{
    public const string NewMessageEventName = "chatMessage";
    public const string SupportAgentsGroup = "support-agents";

    public override async Task OnConnectedAsync()
    {
        if (Context.User?.IsInRole("Admin") == true || Context.User?.IsInRole("Support") == true)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, SupportAgentsGroup);
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (Context.User?.IsInRole("Admin") == true || Context.User?.IsInRole("Support") == true)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, SupportAgentsGroup);
        }

        await base.OnDisconnectedAsync(exception);
    }
}
