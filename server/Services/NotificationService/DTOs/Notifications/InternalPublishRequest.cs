namespace TravelAssistant.Services.NotificationService.Contracts.Notifications;

public sealed class InternalPublishRequest
{
    public int? UserId { get; init; }
    public string Title { get; init; } = "";
    public string Message { get; init; } = "";
    public string Type { get; init; } = "system";
    public bool Broadcast { get; init; }
    public bool Persist { get; init; } = true;
    public int? BookingId { get; init; }
    public string? TravelerName { get; init; }
    public string? Destination { get; init; }
    public int? TargetUserId { get; init; }
}
