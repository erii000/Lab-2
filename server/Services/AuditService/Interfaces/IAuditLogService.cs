using TravelAssistant.Services.AuditService.Contracts.AuditLogs;
using TravelAssistant.Services.AuditService.Models;

namespace TravelAssistant.Services.AuditService.Interfaces;

public interface IAuditLogService
{
    Task<IEnumerable<AuditLog>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<PagedResult<AuditLog>> SearchAsync(AuditLogSearchRequest request, CancellationToken cancellationToken = default);
    Task<AuditLog> CreateAsync(AuditLog auditLog, CancellationToken cancellationToken = default);
}
