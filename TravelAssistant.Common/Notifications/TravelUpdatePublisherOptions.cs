namespace TravelAssistant.Common.Notifications;

public sealed class TravelUpdatePublisherOptions
{
    public const string SectionName = "NotificationService";

    public string BaseUrl { get; set; } = "http://localhost:62375/";
    public string InternalKey { get; set; } = "dev-notification-internal-key";
}
