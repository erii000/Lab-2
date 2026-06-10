namespace TravelAssistant.Services.NotificationService.Contracts.Notifications;

public sealed class NotificationRealtimePayload
{
    public int? NotificationId { get; set; }
    public int? UserId { get; set; }
    public string? Audience { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public bool? IsRead { get; set; }
    public DateTime SentAtUtc { get; set; }
    public int? BookingId { get; set; }
    public string? TravelerName { get; set; }
    public string? Destination { get; set; }
    public int? TargetUserId { get; set; }
}
