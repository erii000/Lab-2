using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelAssistant.Services.AuditService.Interfaces;
using TravelAssistant.Services.AuditService.Models;

namespace TravelAssistant.Services.AuditService.Controllers;

[ApiController]
[Route("api/auditlogs")]
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

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] AuditLog auditLog, CancellationToken cancellationToken)
    {
        var created = await _auditLogService.CreateAsync(auditLog, cancellationToken);
        return Created(string.Empty, created);
    }
}