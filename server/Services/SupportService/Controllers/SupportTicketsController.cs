using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelAssistant.Services.SupportService.Interfaces;
using TravelAssistant.Services.SupportService.Models;

namespace TravelAssistant.Services.SupportService.Controllers;

[ApiController]
[Route("api/supporttickets")]
[Authorize]
public sealed class SupportTicketsController : ControllerBase
{
    private readonly ISupportTicketService _supportTicketService;

    public SupportTicketsController(ISupportTicketService supportTicketService)
    {
        _supportTicketService = supportTicketService;
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Support")]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var data = await _supportTicketService.GetAllAsync(cancellationToken);
        return Ok(data);
    }

    [HttpGet("user/{userId:int}")]
    public async Task<IActionResult> GetByUserId(int userId, CancellationToken cancellationToken)
    {
        var data = await _supportTicketService.GetByUserIdAsync(userId, cancellationToken);
        return Ok(data);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SupportTicket ticket, CancellationToken cancellationToken)
    {
        var created = await _supportTicketService.CreateAsync(ticket, cancellationToken);
        return Created(string.Empty, created);
    }

    [HttpPatch("{id:int}/status")]
    [Authorize(Roles = "Admin,Support")]
    public async Task<IActionResult> UpdateStatus(int id, [FromQuery] string status, CancellationToken cancellationToken)
    {
        var updated = await _supportTicketService.UpdateStatusAsync(id, status, cancellationToken);

        if (updated == null)
            return NotFound(new { message = "Ticket not found" });

        return Ok(updated);
    }
}