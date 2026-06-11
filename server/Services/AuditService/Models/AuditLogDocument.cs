using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace TravelAssistant.Services.AuditService.Models;

public sealed class AuditLogDocument
{
    [BsonId]
    public ObjectId MongoId { get; set; }

    public int Id { get; set; }
    public int? UserId { get; set; }
    public string Action { get; set; } = string.Empty;
    public string EntityName { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public AuditLog ToModel() => new()
    {
        Id = Id,
        UserId = UserId,
        Action = Action,
        EntityName = EntityName,
        Details = Details,
        CreatedAt = CreatedAt
    };

    public static AuditLogDocument FromModel(AuditLog auditLog) => new()
    {
        Id = auditLog.Id,
        UserId = auditLog.UserId,
        Action = auditLog.Action,
        EntityName = auditLog.EntityName,
        Details = auditLog.Details,
        CreatedAt = auditLog.CreatedAt == default ? DateTime.UtcNow : auditLog.CreatedAt
    };
}
