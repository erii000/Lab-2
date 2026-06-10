namespace TravelAssistant.Common.Notifications;

public interface ITravelUpdatePublisher
{
    Task NotifyUserAsync(
        int userId,
        string title,
        string message,
        string type = "system",
        TravelUpdateContext? context = null,
        CancellationToken cancellationToken = default);

    Task BroadcastAsync(
        string title,
        string message,
        string type = "system",
        TravelUpdateContext? context = null,
        CancellationToken cancellationToken = default);
}
