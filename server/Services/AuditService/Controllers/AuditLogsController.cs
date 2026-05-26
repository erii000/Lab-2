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
    private readonly IConfiguration _configuration;

    public AuditLogsController(IAuditLogService auditLogService, IConfiguration configuration)
    {
        _auditLogService = auditLogService;
        _configuration = configuration;
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

    /// <summary>Admin JWT or trusted internal key (X-Audit-Key) from other microservices.</summary>
    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateAuditLogRequest request, CancellationToken cancellationToken)
    {
        var isAdmin = User.Identity?.IsAuthenticated == true && User.IsInRole("Admin");
        if (!IsInternalAuditCaller() && !isAdmin)
            return Unauthorized();

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

    private bool IsInternalAuditCaller()
    {
        var expected = _configuration["Audit:InternalKey"];
        if (string.IsNullOrWhiteSpace(expected))
            return false;

        return string.Equals(
            Request.Headers["X-Audit-Key"].FirstOrDefault(),
            expected,
            StringComparison.Ordinal);
    }
}
