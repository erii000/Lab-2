using TravelAssistant.Services.AuditService.Models;

namespace TravelAssistant.Services.AuditService.Interfaces
{
    public interface IAuditLogService
    {
        Task<IEnumerable<AuditLog>> GetAllAsync(CancellationToken cancellationToken = default);
        Task<AuditLog> CreateAsync(AuditLog auditLog, CancellationToken cancellationToken = default);
    }
}