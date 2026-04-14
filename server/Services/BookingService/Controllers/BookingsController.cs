using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelAssistant.Services.BookingService.DTOs.Bookings;
using TravelAssistant.Services.BookingService.Security;
using TravelAssistant.Services.BookingService.Services.Bookings;

namespace TravelAssistant.Services.BookingService.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/[controller]")]
public sealed class BookingsController : ControllerBase
{
    private readonly IBookingWorkflowService _bookingWorkflowService;

    public BookingsController(IBookingWorkflowService bookingWorkflowService) =>
        _bookingWorkflowService = bookingWorkflowService;

    [HttpPost]
    [ProducesResponseType(typeof(BookingDetailResponse), StatusCodes.Status201Created)]
    public async Task<ActionResult<BookingDetailResponse>> Create(
        [FromBody] CreateBookingRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
            return Unauthorized();

        var booking = await _bookingWorkflowService.CreateAsync(userId.Value, request, cancellationToken);
        var dto = await _bookingWorkflowService.GetAsync(booking.Id, userId.Value, User.IsAdmin(), cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = booking.Id }, dto);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(BookingDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BookingDetailResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
            return Unauthorized();

        var dto = await _bookingWorkflowService.GetAsync(id, userId.Value, User.IsAdmin(), cancellationToken);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpPatch("{id:int}/status")]
    [ProducesResponseType(typeof(BookingDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BookingDetailResponse>> PatchStatus(
        int id,
        [FromBody] UpdateBookingStatusRequest request,
        CancellationToken cancellationToken)
    {
        if (!User.CanManageBookingLifecycle())
            return Forbid();

        var result = await _bookingWorkflowService.TryUpdateStatusAsync(id, request.Status, cancellationToken);
        if (result.NotFound)
            return NotFound();

        if (result.InvalidTransition)
        {
            return BadRequest(new
            {
                error = "Invalid status transition.",
                currentStatus = result.Data?.Status,
                requested = request.Status
            });
        }

        return Ok(result.Data);
    }
}
