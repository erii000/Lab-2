using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SmartTravelAssistant.API.Contracts.Notifications;
using SmartTravelAssistant.API.Services.Interfaces;

namespace SmartTravelAssistant.API.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public sealed class NotificationsController : ControllerBase
{
    private readonly IRealtimeNotificationService _notificationService;

    public NotificationsController(IRealtimeNotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpPost("broadcast")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status202Accepted)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Broadcast([FromBody] SendNotificationRequest request, CancellationToken cancellationToken)
    {
        await _notificationService.BroadcastTravelUpdateAsync(request.Title, request.Message, request.Type, cancellationToken);
        return Accepted(new { status = "sent" });
    }
}
