using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelAssistant.Common.Export;
using TravelAssistant.Services.BookingService.DTOs.Bookings;
using TravelAssistant.Services.BookingService.Repositories;
using TravelAssistant.Services.BookingService.Security;
using TravelAssistant.Services.BookingService.Services.Bookings;
using BookingImportRow = TravelAssistant.Services.BookingService.Services.Bookings.BookingImportRow;

namespace TravelAssistant.Services.BookingService.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/[controller]")]
public sealed class BookingsController : ControllerBase
{
    private readonly IBookingWorkflowService _bookingWorkflowService;
    private readonly IBookingRepository _bookingRepository;
    private readonly IBookingImportService _bookingImportService;

    public BookingsController(
        IBookingWorkflowService bookingWorkflowService,
        IBookingRepository bookingRepository,
        IBookingImportService bookingImportService)
    {
        _bookingWorkflowService = bookingWorkflowService;
        _bookingRepository = bookingRepository;
        _bookingImportService = bookingImportService;
    }

    /// <summary>Bookings for the signed-in user.</summary>
    [HttpGet]
    public async Task<IActionResult> ListMine(CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
            return Unauthorized();

        var request = new BookingSearchRequest
        {
            UserId = userId.Value,
            Page = 1,
            PageSize = 100,
            SortBy = "bookingDate",
            SortOrder = "desc"
        };
        var (items, total) = await _bookingRepository.SearchAsync(request, cancellationToken);
        var mapped = items.Select(b => new
        {
            b.Id,
            b.UserId,
            b.ItineraryId,
            b.BookingType,
            b.Provider,
            b.ReferenceCode,
            b.Amount,
            b.Currency,
            b.BookingDate,
            b.Status,
            b.MetadataJson
        }).ToList();

        return Ok(new { Total = total, Items = mapped });
    }

    [HttpGet("search")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Search([FromQuery] BookingSearchRequest request, CancellationToken cancellationToken)
    {
        var (items, total) = await _bookingRepository.SearchAsync(request, cancellationToken);
        var mapped = items.Select(b => new
        {
            b.Id,
            b.UserId,
            b.ItineraryId,
            b.BookingType,
            b.Provider,
            b.ReferenceCode,
            b.Amount,
            b.Currency,
            b.BookingDate,
            b.Status,
            b.MetadataJson
        }).ToList();

        return Ok(new
        {
            Total = total,
            Page = request.Page < 1 ? 1 : request.Page,
            PageSize = Math.Clamp(request.PageSize, 1, 100),
            Items = mapped
        });
    }

    [HttpGet("export")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Export([FromQuery] string format = "json", [FromQuery] BookingSearchRequest? filters = null, CancellationToken cancellationToken = default)
    {
        filters ??= new BookingSearchRequest();
        var items = await _bookingRepository.ListForExportAsync(filters, 5000, cancellationToken);
        var headers = new[]
        {
            "Id", "UserId", "ItineraryId", "BookingType", "Provider", "ReferenceCode", "Amount", "Currency", "BookingDate", "Status"
        };
        var rows = items.Select(b => new[]
        {
            b.Id.ToString(),
            b.UserId.ToString(),
            b.ItineraryId?.ToString() ?? "",
            b.BookingType,
            b.Provider,
            b.ReferenceCode,
            b.Amount?.ToString() ?? "",
            b.Currency ?? "",
            b.BookingDate.ToString("O"),
            b.Status
        }).ToList();

        var normalized = (format ?? "json").Trim().ToLowerInvariant();
        return normalized switch
        {
            "csv" => File(TabularExport.ToCsv(headers, rows), "text/csv", $"bookings-{DateTime.UtcNow:yyyyMMdd}.csv"),
            "xlsx" => File(
                TabularExport.ToXlsx("Bookings", headers, rows),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"bookings-{DateTime.UtcNow:yyyyMMdd}.xlsx"),
            _ => File(TabularExport.ToJsonUtf8(items), "application/json", $"bookings-{DateTime.UtcNow:yyyyMMdd}.json")
        };
    }

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

    /// <summary>Discard a pending booking draft (owner only).</summary>
    [HttpPost("{id:int}/discard")]
    [ProducesResponseType(typeof(BookingDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BookingDetailResponse>> Discard(int id, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
            return Unauthorized();

        var dto = await _bookingWorkflowService.DiscardAsync(id, userId.Value, cancellationToken);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpPost("{id:int}/confirm-payment")]
    [ProducesResponseType(typeof(BookingDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BookingDetailResponse>> ConfirmPayment(int id, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
            return Unauthorized();

        var dto = await _bookingWorkflowService.ConfirmPaymentAsync(id, userId.Value, cancellationToken);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpPatch("{id:int}")]
    [ProducesResponseType(typeof(BookingDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BookingDetailResponse>> Patch(
        int id,
        [FromBody] UpdateBookingRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
            return Unauthorized();

        var dto = await _bookingWorkflowService.UpdateAsync(id, userId.Value, User.IsAdmin(), request, cancellationToken);
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

    /// <summary>Admin batch create. All rows validated first; nothing persisted if any row fails.</summary>
    [HttpPost("import")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Import([FromBody] IReadOnlyList<BookingImportRow>? rows, CancellationToken cancellationToken)
    {
        if (rows is null || rows.Count == 0)
            return BadRequest(new { error = "Empty payload." });

        var (inserted, errors) = await _bookingImportService.ImportAsync(rows, cancellationToken);
        if (errors.Count > 0)
            return BadRequest(new { errors });

        return Ok(new { inserted });
    }
}
