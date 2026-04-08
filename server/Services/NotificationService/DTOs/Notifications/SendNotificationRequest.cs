using System.ComponentModel.DataAnnotations;

namespace TravelAssistant.Services.NotificationService.Contracts.Notifications;

public sealed class SendNotificationRequest
{
    [Required]
    [MaxLength(140)]
    public string Title { get; set; } = string.Empty;

    [Required]
    [MaxLength(1000)]
    public string Message { get; set; } = string.Empty;

    [Required]
    [MaxLength(80)]
    public string Type { get; set; } = "travel-update";
}

