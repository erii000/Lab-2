using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelAssistant.Services.AuditService.Contracts.AuditLogs;
using TravelAssistant.Services.AuditService.Interfaces;
using TravelAssistant.Services.AuditService.Models;

namespace TravelAssistant.Services.AuditService.Controllers;

[ApiController]
[Route("api/auditlogs")]
[Route("api/v1/auditlogs")]
[Authorize(Roles = "Admin")]
public sealed class AuditLogsController : ControllerBase
{
    private readonly IAuditLogService _auditLogService;

    public AuditLogsController(IAuditLogService auditLogService)
    {
        _auditLogService = auditLogService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var data = await _auditLogService.GetAllAsync(cancellationToken);
        return Ok(data);
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] AuditLogSearchRequest request, CancellationToken cancellationToken)
    {
        var data = await _auditLogService.SearchAsync(request, cancellationToken);
        return Ok(data);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAuditLogRequest request, CancellationToken cancellationToken)
    {
        var auditLog = new AuditLog
        {
            UserId = request.UserId,
            Action = request.Action.Trim(),
            EntityName = request.EntityName.Trim(),
            Details = request.Details?.Trim() ?? string.Empty,
            CreatedAt = DateTime.UtcNow
        };

        var created = await _auditLogService.CreateAsync(auditLog, cancellationToken);
        return Created(string.Empty, created);
    }
}
