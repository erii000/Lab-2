namespace TravelAssistant.Services.NotificationService.Models
{
    public class Notification
    {
        public int Id { get; set; }
        public int? UserId { get; set; }
        /// <summary>When "admin", row is an ops broadcast (UserId may be null).</summary>
        public string? Audience { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public bool IsRead { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}