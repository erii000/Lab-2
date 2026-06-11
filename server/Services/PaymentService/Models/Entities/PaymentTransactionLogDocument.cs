using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TravelAssistant.Services.PaymentService.Models.Entities;

public sealed class PaymentTransactionLogDocument
{
    [BsonId]
    public ObjectId MongoId { get; set; }

    public long Id { get; set; }
    public int? PaymentId { get; set; }
    public string Provider { get; set; } = "stripe";
    public string ExternalEventId { get; set; } = string.Empty;
    public string EventType { get; set; } = string.Empty;
    public string? Payload { get; set; }
    public bool ProcessedOk { get; set; }
    public string? ErrorMessage { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public static PaymentTransactionLogDocument FromEntity(PaymentTransactionLog log) => new()
    {
        Id = log.Id,
        PaymentId = log.PaymentId,
        Provider = log.Provider,
        ExternalEventId = log.ExternalEventId,
        EventType = log.EventType,
        Payload = log.Payload,
        ProcessedOk = log.ProcessedOk,
        ErrorMessage = log.ErrorMessage,
        CreatedAt = log.CreatedAt == default ? DateTime.UtcNow : log.CreatedAt
    };
}
