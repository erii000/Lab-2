namespace TravelAssistant.Services.PaymentService.Models.Entities;

public sealed class PaymentTransactionLog
{
    public long Id { get; set; }
    public int? PaymentId { get; set; }
    public Payment? Payment { get; set; }
    public string Provider { get; set; } = "stripe";
    public string ExternalEventId { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public string? Payload { get; set; }
    public bool ProcessedOk { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
