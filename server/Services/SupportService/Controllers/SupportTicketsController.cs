using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelAssistant.Services.SupportService.Contracts;
using TravelAssistant.Services.SupportService.Interfaces;
using TravelAssistant.Services.SupportService.Models;
using TravelAssistant.Services.SupportService.Security;

namespace TravelAssistant.Services.SupportService.Controllers;

[ApiController]
[Route("api/supporttickets")]
[Route("api/v1/supporttickets")]
public sealed class SupportTicketsController : ControllerBase
{
    private readonly ISupportTicketService _supportTicketService;

    public SupportTicketsController(ISupportTicketService supportTicketService)
    {
        _supportTicketService = supportTicketService;
    }

    [Authorize]
    [HttpGet]
    [Authorize(Roles = "Admin,Support")]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var data = await _supportTicketService.GetAllAsync(cancellationToken);
        return Ok(data);
    }

    [Authorize]
    [HttpGet("user/{userId:int}")]
    public async Task<IActionResult> GetByUserId(int userId, CancellationToken cancellationToken)
    {
        var currentUserId = User.GetUserId();
        if (currentUserId is null)
            return Unauthorized();

        if (!User.IsInRole("Admin") && !User.IsInRole("Support") && currentUserId.Value != userId)
            return Forbid();

        var data = await _supportTicketService.GetByUserIdAsync(userId, cancellationToken);
        return Ok(data);
    }

    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SupportTicket ticket, CancellationToken cancellationToken)
    {
        var created = await _supportTicketService.CreateAsync(ticket, cancellationToken);
        return Created(string.Empty, created);
    }

    /// <summary>Contact form — guests allowed; authenticated users get their user id.</summary>
    [AllowAnonymous]
    [HttpPost("contact")]
    public async Task<IActionResult> CreateFromContact(
        [FromBody] CreateContactTicketRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Subject) || string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { error = "Subject and message are required." });

        var userId = User.GetUserId() ?? 0;
        var priority = string.IsNullOrWhiteSpace(request.Priority) ? "standard" : request.Priority.Trim();
        var tripType = string.IsNullOrWhiteSpace(request.TripType) ? "general" : request.TripType.Trim();
        var booking = string.IsNullOrWhiteSpace(request.BookingId) ? "—" : request.BookingId.Trim();
        var email = string.IsNullOrWhiteSpace(request.Email) ? "—" : request.Email.Trim();
        var name = string.IsNullOrWhiteSpace(request.FullName) ? "Guest" : request.FullName.Trim();

        var description =
            $"From: {name} <{email}>\n" +
            $"Trip type: {tripType}\n" +
            $"Priority: {priority}\n" +
            $"Booking ref: {booking}\n\n" +
            request.Message.Trim();

        var ticket = new SupportTicket
        {
            UserId = userId,
            Subject = request.Subject.Trim(),
            Description = description,
            Status = "Open",
            CreatedAt = DateTime.UtcNow
        };

        var created = await _supportTicketService.CreateAsync(ticket, cancellationToken);
        return Created(string.Empty, created);
    }

    [Authorize]
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