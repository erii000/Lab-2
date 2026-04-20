using System.ComponentModel.DataAnnotations;

namespace TravelAssistant.Services.AuditService.Contracts.AuditLogs;

public sealed class CreateAuditLogRequest
{
    public int? UserId { get; set; }

    [Required]
    [MaxLength(100)]
    public string Action { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string EntityName { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string Details { get; set; } = string.Empty;
}
