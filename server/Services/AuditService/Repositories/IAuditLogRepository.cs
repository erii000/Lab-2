using TravelAssistant.Services.AuditService.Contracts.AuditLogs;
using TravelAssistant.Services.AuditService.Models;

namespace TravelAssistant.Services.AuditService.Repositories;

public interface IAuditLogRepository
{
    Task<IReadOnlyList<AuditLog>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<(IReadOnlyList<AuditLog> Items, int Total)> SearchAsync(AuditLogSearchRequest request, CancellationToken cancellationToken = default);
    Task<AuditLog> AddAsync(AuditLog auditLog, CancellationToken cancellationToken = default);
}
