namespace TravelAssistant.Services.RealTimeCommunicationService.Models;

public sealed class ChatThreadSummary
{
    public int UserId { get; set; }
    public string LastMessage { get; set; } = string.Empty;
    public DateTime LastSentAt { get; set; }
    public int MessageCount { get; set; }
}
