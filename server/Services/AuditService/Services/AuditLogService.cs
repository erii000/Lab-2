using TravelAssistant.Services.AuditService.Contracts.AuditLogs;
using TravelAssistant.Services.AuditService.Interfaces;
using TravelAssistant.Services.AuditService.Models;
using TravelAssistant.Services.AuditService.Repositories;

namespace TravelAssistant.Services.AuditService.Services;

public sealed class AuditLogService : IAuditLogService
{
    private readonly IAuditLogRepository _repository;

    public AuditLogService(IAuditLogRepository repository) => _repository = repository;

    public async Task<IEnumerable<AuditLog>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _repository.GetAllAsync(cancellationToken);

    public async Task<PagedResult<AuditLog>> SearchAsync(AuditLogSearchRequest request, CancellationToken cancellationToken = default)
    {
        var (items, total) = await _repository.SearchAsync(request, cancellationToken);
        var page = request.Page < 1 ? 1 : request.Page;
        var pageSize = request.PageSize switch
        {
            < 1 => 20,
            > 100 => 100,
            _ => request.PageSize
        };

        return new PagedResult<AuditLog>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = total,
            TotalPages = total == 0 ? 0 : (int)Math.Ceiling(total / (double)pageSize)
        };
    }

    public Task<AuditLog> CreateAsync(AuditLog auditLog, CancellationToken cancellationToken = default) =>
        _repository.AddAsync(auditLog, cancellationToken);
}
