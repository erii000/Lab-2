using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelAssistant.Services.NotificationService.Interfaces;
using TravelAssistant.Services.NotificationService.Models;

namespace TravelAssistant.Services.NotificationService.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public sealed class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
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
        var data = await _notificationService.GetByUserIdAsync(userId, cancellationToken);
        return Ok(data);
    }

    [HttpPatch("{id:int}/read")]
    public async Task<IActionResult> MarkAsRead(int id, CancellationToken cancellationToken)
    {
        var updated = await _notificationService.MarkAsReadAsync(id, cancellationToken);

        if (updated == null)
            return NotFound(new { message = "Notification not found" });

        return Ok(updated);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Notification notification, CancellationToken cancellationToken)
    {
        var created = await _notificationService.CreateAsync(notification, cancellationToken);
        return CreatedAtAction(nameof(GetByUserId), new { userId = created.UserId }, created);
    }
}