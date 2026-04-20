namespace TravelAssistant.Services.NotificationService.Contracts.Notifications;

public sealed class NotificationSearchRequest
{
    public string? Q { get; set; }
    public string? Type { get; set; }
    public bool? IsRead { get; set; }
    public int? UserId { get; set; }
    public DateTime? CreatedFromUtc { get; set; }
    public DateTime? CreatedToUtc { get; set; }
    public string SortBy { get; set; } = "createdAt";
    public string SortOrder { get; set; } = "desc";
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
