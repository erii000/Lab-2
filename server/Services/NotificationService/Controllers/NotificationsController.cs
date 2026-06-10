using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TravelAssistant.Common.Export;
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
    private readonly IConfiguration _configuration;

    public NotificationsController(
        INotificationService notificationService,
        IRealtimeNotificationService realtimeNotificationService,
        IConfiguration configuration)
    {
        _notificationService = notificationService;
        _realtimeNotificationService = realtimeNotificationService;
        _configuration = configuration;
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

    /// <summary>Admin ops feed — persisted broadcast alerts (UserId = 0).</summary>
    [HttpGet("ops")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetOpsFeed([FromQuery] int pageSize = 50, CancellationToken cancellationToken = default)
    {
        var data = await _notificationService.SearchAsync(new NotificationSearchRequest
        {
            Audience = "admin",
            Page = 1,
            PageSize = pageSize < 1 ? 50 : Math.Min(pageSize, 100),
            SortBy = "createdAt",
            SortOrder = "desc"
        }, cancellationToken);
        return Ok(data.Items);
    }

    [HttpGet("search")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Search([FromQuery] NotificationSearchRequest request, CancellationToken cancellationToken)
    {
        var data = await _notificationService.SearchAsync(request, cancellationToken);
        return Ok(data);
    }

    [HttpGet("export")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Export(
        [FromQuery] string format = "json",
        [FromQuery] NotificationSearchRequest? filters = null,
        CancellationToken cancellationToken = default)
    {
        filters ??= new NotificationSearchRequest();
        var all = new List<Notification>();
        var page = 1;
        const int pageSize = 100;
        while (true)
        {
            filters.Page = page;
            filters.PageSize = pageSize;
            var batch = await _notificationService.SearchAsync(filters, cancellationToken);
            all.AddRange(batch.Items);
            if (batch.Items.Count < pageSize || all.Count >= 10_000)
                break;
            page++;
            if (page > 500)
                break;
        }

        var headers = new[] { "Id", "UserId", "Title", "Message", "Type", "IsRead", "CreatedAt" };
        var rows = all.Select(n => new[]
        {
            n.Id.ToString(),
            n.UserId.ToString(),
            n.Title,
            n.Message,
            n.Type,
            n.IsRead.ToString(),
            n.CreatedAt.ToString("O")
        }).ToList();

        var normalized = (format ?? "json").Trim().ToLowerInvariant();
        return normalized switch
        {
            "csv" => File(TabularExport.ToCsv(headers, rows), "text/csv", $"notifications-{DateTime.UtcNow:yyyyMMdd}.csv"),
            "xlsx" => File(
                TabularExport.ToXlsx("Notifications", headers, rows),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"notifications-{DateTime.UtcNow:yyyyMMdd}.xlsx"),
            _ => File(TabularExport.ToJsonUtf8(all), "application/json", $"notifications-{DateTime.UtcNow:yyyyMMdd}.json")
        };
    }

    public sealed class NotificationImportRow
    {
        public int UserId { get; set; }
        public string Title { get; set; } = "";
        public string Message { get; set; } = "";
        public string Type { get; set; } = "system";
    }

    [HttpPost("import")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Import([FromBody] IReadOnlyList<NotificationImportRow>? rows, CancellationToken cancellationToken)
    {
        if (rows is null || rows.Count == 0)
            return BadRequest(new { error = "Empty payload." });

        var errors = new List<object>();
        var created = new List<Notification>();
        for (var i = 0; i < rows.Count; i++)
        {
            var r = rows[i];
            if (r.UserId <= 0 || string.IsNullOrWhiteSpace(r.Title))
                errors.Add(new { row = i + 1, message = "UserId and Title are required." });
            else
                created.Add(new Notification
                {
                    UserId = r.UserId,
                    Title = r.Title.Trim(),
                    Message = r.Message?.Trim() ?? "",
                    Type = string.IsNullOrWhiteSpace(r.Type) ? "system" : r.Type.Trim(),
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                });
        }

        if (errors.Count > 0)
            return BadRequest(new { errors });

        foreach (var n in created)
            await _notificationService.CreateAsync(n, cancellationToken);

        return Ok(new { inserted = created.Count });
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
        if (created.UserId is > 0)
        {
            await _realtimeNotificationService.SendUserTravelUpdateAsync(
                created.UserId.Value,
                created.Title,
                created.Message,
                created.Type,
                cancellationToken: cancellationToken);
        }

        return CreatedAtAction(nameof(GetByUserId), new { userId = created.UserId }, created);
    }

    /// <summary>Trusted microservices (X-Notification-Key) — persist + SignalR.</summary>
    [AllowAnonymous]
    [HttpPost("internal/publish")]
    public async Task<IActionResult> InternalPublish(
        [FromBody] InternalPublishRequest request,
        CancellationToken cancellationToken)
    {
        if (!IsInternalNotificationCaller())
            return Unauthorized();

        if (request.Broadcast)
        {
            var title = request.Title.Trim();
            var message = request.Message?.Trim() ?? "";
            var type = string.IsNullOrWhiteSpace(request.Type) ? "system" : request.Type.Trim();

            try
            {
                await _notificationService.CreateAsync(new Notification
                {
                    UserId = null,
                    Audience = "admin",
                    Title = title,
                    Message = message,
                    Type = type,
                    IsRead = false
                }, cancellationToken);
            }
            catch (Exception ex)
            {
                // Log but still push live to connected admins via SignalR.
                Console.WriteLine($"Admin ops notification persist failed: {ex.Message}");
            }

            await _realtimeNotificationService.BroadcastTravelUpdateAsync(
                title,
                message,
                type,
                request.BookingId,
                request.TravelerName,
                request.Destination,
                request.TargetUserId,
                cancellationToken);
        }
        else if (request.UserId is > 0)
        {
            var title = request.Title.Trim();
            var message = request.Message?.Trim() ?? "";
            var type = string.IsNullOrWhiteSpace(request.Type) ? "system" : request.Type.Trim();

            if (request.Persist)
            {
                try
                {
                    var created = await _notificationService.CreateAsync(new Notification
                    {
                        UserId = request.UserId.Value,
                        Title = title,
                        Message = message,
                        Type = type,
                        IsRead = false
                    }, cancellationToken);

                    await _realtimeNotificationService.SendUserTravelUpdateAsync(
                        created.UserId!.Value,
                        created.Title,
                        created.Message,
                        created.Type,
                        request.BookingId,
                        request.TravelerName,
                        request.Destination,
                        request.TargetUserId,
                        cancellationToken);
                }
                catch
                {
                    await _realtimeNotificationService.SendUserTravelUpdateAsync(
                        request.UserId.Value,
                        title,
                        message,
                        type,
                        request.BookingId,
                        request.TravelerName,
                        request.Destination,
                        request.TargetUserId,
                        cancellationToken);
                }
            }
            else
            {
                await _realtimeNotificationService.SendUserTravelUpdateAsync(
                    request.UserId.Value,
                    title,
                    message,
                    type,
                    request.BookingId,
                    request.TravelerName,
                    request.Destination,
                    request.TargetUserId,
                    cancellationToken);
            }
        }

        return Accepted(new { request.Title, request.Message, sentAtUtc = DateTime.UtcNow });
    }

    [HttpPost("broadcast")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Broadcast([FromBody] SendNotificationRequest request, CancellationToken cancellationToken)
    {
        await _realtimeNotificationService.BroadcastTravelUpdateAsync(
            request.Title,
            request.Message,
            request.Type,
            cancellationToken: cancellationToken);

        return Accepted(new
        {
            request.Title,
            request.Message,
            request.Type,
            sentAtUtc = DateTime.UtcNow
        });
    }

    private bool CanAccessUserNotifications(int? userId)
    {
        if (User.IsInRole("Admin"))
            return true;

        if (userId is null or <= 0)
            return false;

        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(currentUserId, out var parsedUserId) && parsedUserId == userId.Value;
    }

    private bool IsInternalNotificationCaller()
    {
        var expected = _configuration["Notification:InternalKey"];
        if (string.IsNullOrWhiteSpace(expected))
            return false;

        return string.Equals(
            Request.Headers["X-Notification-Key"].FirstOrDefault(),
            expected,
            StringComparison.Ordinal);
    }
}
