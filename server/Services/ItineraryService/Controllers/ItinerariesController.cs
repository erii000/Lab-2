using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelAssistant.Common.Export;
using TravelAssistant.Services.ItineraryService.Contracts.Itineraries;
using TravelAssistant.Services.ItineraryService.DTOs.Itineraries;
using TravelAssistant.Services.ItineraryService.Security;
using TravelAssistant.Services.ItineraryService.Services.Interfaces;
using TravelAssistant.Services.ItineraryService.Services.ItineraryPlanning;

namespace TravelAssistant.Services.ItineraryService.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/[controller]")]
public sealed class ItinerariesController : ControllerBase
{
    private readonly IItineraryPlanningService _itineraryPlanningService;
    private readonly IItinerarySearchService _itinerarySearchService;

    public ItinerariesController(
        IItineraryPlanningService itineraryPlanningService,
        IItinerarySearchService itinerarySearchService)
    {
        _itineraryPlanningService = itineraryPlanningService;
        _itinerarySearchService = itinerarySearchService;
    }

    [HttpPost("generate")]
    [ProducesResponseType(typeof(GenerateItineraryResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<GenerateItineraryResponse>> Generate(
        [FromBody] GenerateItineraryRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
            return Unauthorized();

        var created = await _itineraryPlanningService.GenerateAsync(userId.Value, request, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}/timeline")]
    [ProducesResponseType(typeof(ItineraryDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ItineraryDetailResponse>> SaveTimeline(
        int id,
        [FromBody] SaveItineraryTimelineRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
            return Unauthorized();

        var dto = await _itineraryPlanningService.SaveTimelineAsync(
            id,
            userId.Value,
            User.IsAdmin(),
            request,
            cancellationToken);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ItineraryDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ItineraryDetailResponse>> GetById(int id, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
            return Unauthorized();

        var dto = await _itineraryPlanningService.GetByIdAsync(id, userId.Value, User.IsAdmin(), cancellationToken);
        return dto is null ? NotFound() : Ok(dto);
    }

    [HttpGet("user/{userId:int}")]
    [ProducesResponseType(typeof(IReadOnlyList<ItinerarySummaryDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IReadOnlyList<ItinerarySummaryDto>>> ListForUser(
        int userId,
        CancellationToken cancellationToken)
    {
        var requester = User.GetUserId();
        if (requester is null)
            return Unauthorized();

        if (!User.IsAdmin() && requester.Value != userId)
            return Forbid();

        var list = await _itineraryPlanningService.ListForUserAsync(userId, requester.Value, User.IsAdmin(), cancellationToken);
        return Ok(list);
    }

    [HttpGet("search")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Search([FromQuery] ItinerarySearchRequest request, CancellationToken cancellationToken)
    {
        var data = await _itinerarySearchService.SearchAsync(request, cancellationToken);
        return Ok(data);
    }

    [HttpGet("export")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Export(
        [FromQuery] string format = "json",
        [FromQuery] ItinerarySearchRequest? filters = null,
        CancellationToken cancellationToken = default)
    {
        filters ??= new ItinerarySearchRequest();
        var all = new List<ItinerarySearchItemResponse>();
        var page = 1;
        const int pageSize = 100;
        while (true)
        {
            filters.Page = page;
            filters.PageSize = pageSize;
            var batch = await _itinerarySearchService.SearchAsync(filters, cancellationToken);
            all.AddRange(batch.Items);
            if (batch.Items.Count < pageSize || all.Count >= 10_000)
                break;
            page++;
            if (page > 500)
                break;
        }

        var headers = new[] { "Id", "UserId", "Title", "Status", "StartDate", "EndDate", "Budget", "Destinations" };
        var rows = all.Select(i => new[]
        {
            i.Id.ToString(),
            i.UserId.ToString(),
            i.Title,
            i.Status,
            i.StartDate.ToString("O"),
            i.EndDate.ToString("O"),
            i.Budget?.ToString() ?? "",
            string.Join(";", i.Destinations)
        }).ToList();

        var normalized = (format ?? "json").Trim().ToLowerInvariant();
        return normalized switch
        {
            "csv" => File(TabularExport.ToCsv(headers, rows), "text/csv", $"itineraries-{DateTime.UtcNow:yyyyMMdd}.csv"),
            "xlsx" => File(
                TabularExport.ToXlsx("Itineraries", headers, rows),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"itineraries-{DateTime.UtcNow:yyyyMMdd}.xlsx"),
            _ => File(TabularExport.ToJsonUtf8(all), "application/json", $"itineraries-{DateTime.UtcNow:yyyyMMdd}.json")
        };
    }

    public sealed class ItineraryImportRow
    {
        public int UserId { get; set; }
        public GenerateItineraryRequest Plan { get; set; } = new();
    }

    [HttpPost("import")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Import([FromBody] IReadOnlyList<ItineraryImportRow>? rows, CancellationToken cancellationToken)
    {
        if (rows is null || rows.Count == 0)
            return BadRequest(new { error = "Empty payload." });

        var errors = new List<object>();
        for (var i = 0; i < rows.Count; i++)
        {
            var r = rows[i];
            if (r.UserId <= 0 || r.Plan is null || string.IsNullOrWhiteSpace(r.Plan.Destination))
                errors.Add(new { row = i + 1, message = "UserId and Plan.Destination are required." });
        }

        if (errors.Count > 0)
            return BadRequest(new { errors });

        var created = new List<int>();
        foreach (var r in rows)
        {
            var result = await _itineraryPlanningService.GenerateAsync(r.UserId, r.Plan!, cancellationToken);
            created.Add(result.Id);
        }

        return Ok(new { inserted = created.Count, ids = created });
    }
}