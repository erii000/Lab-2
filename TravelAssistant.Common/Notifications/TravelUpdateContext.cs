namespace TravelAssistant.Common.Notifications;

public sealed class TravelUpdateContext
{
    public int? BookingId { get; init; }
    public string? TravelerName { get; init; }
    public string? Destination { get; init; }
    /// <summary>Support/live-chat traveler id (for admin deep links).</summary>
    public int? TargetUserId { get; init; }
}
