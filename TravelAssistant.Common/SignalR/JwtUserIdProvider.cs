using System.Security.Claims;
using Microsoft.AspNetCore.SignalR;

namespace TravelAssistant.Common.SignalR;

public sealed class JwtUserIdProvider : IUserIdProvider
{
    public string? GetUserId(HubConnectionContext connection) =>
        connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
}
