using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TravelAssistant.Services.NotificationService.Contracts.Notifications;
using TravelAssistant.Services.NotificationService.Interfaces;
using TravelAssistant.Services.NotificationService.Models;
using TravelAssistant.Services.NotificationService.Services.Interfaces;

namespace TravelAssistant.Services.NotificationService.Controllers;

[ApiController]
[Route("api/notifications")]
[Route("api/v1/notifications")]
[Authorize]
public sealed class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;
    private readonly IRealtimeNotificationService _realtimeNotificationService;

    public NotificationsController(
        INotificationService notificationService,
        IRealtimeNotificationService realtimeNotificationService)
    {
        _notificationService = notificationService;
        _realtimeNotificationService = realtimeNotificationService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var data = await _notificationService.GetAllAsync(cancellationToken);
        return Ok(data);
    }

    [HttpGet("user/{userId:int}")]
    public async Task<IActionResult> GetByUserId(int userId, CancellationToken cancellationToken)
    {
        if (!CanAccessUserNotifications(userId))
        {
            return Forbid();
        }

        var data = await _notificationService.GetByUserIdAsync(userId, cancellationToken);
        return Ok(data);
    }

    [HttpGet("search")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Search([FromQuery] NotificationSearchRequest request, CancellationToken cancellationToken)
    {
        var data = await _notificationService.SearchAsync(request, cancellationToken);
        return Ok(data);
    }

    [HttpPatch("{id:int}/read")]
    public async Task<IActionResult> MarkAsRead(int id, CancellationToken cancellationToken)
    {
        var existing = await _notificationService.GetByIdAsync(id, cancellationToken);

        if (existing == null)
            return NotFound(new { message = "Notification not found" });

        if (!CanAccessUserNotifications(existing.UserId))
        {
            return Forbid();
        }

        var updated = await _notificationService.MarkAsReadAsync(id, cancellationToken);

        if (updated == null)
            return NotFound(new { message = "Notification not found" });

        return Ok(updated);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Notification notification, CancellationToken cancellationToken)
    {
        var created = await _notificationService.CreateAsync(notification, cancellationToken);
        await _realtimeNotificationService.SendUserTravelUpdateAsync(
            created.UserId,
            created.Title,
            created.Message,
            created.Type,
            cancellationToken);

        return CreatedAtAction(nameof(GetByUserId), new { userId = created.UserId }, created);
    }

    [HttpPost("broadcast")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Broadcast([FromBody] SendNotificationRequest request, CancellationToken cancellationToken)
    {
        await _realtimeNotificationService.BroadcastTravelUpdateAsync(
            request.Title,
            request.Message,
            request.Type,
            cancellationToken);

        return Accepted(new
        {
            request.Title,
            request.Message,
            request.Type,
            sentAtUtc = DateTime.UtcNow
        });
    }

    private bool CanAccessUserNotifications(int userId)
    {
        if (User.IsInRole("Admin"))
        {
            return true;
        }

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(currentUserId, out var parsedUserId) && parsedUserId == userId;
    }
}
