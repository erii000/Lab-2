using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelAssistant.Common.Export;
using TravelAssistant.Services.BookingService.DTOs.Bookings;
using TravelAssistant.Services.BookingService.Repositories;

namespace TravelAssistant.Services.BookingService.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/v1/reports")]
public sealed class AdminReportsController : ControllerBase
{
    private readonly IBookingRepository _bookingRepository;

    public AdminReportsController(IBookingRepository bookingRepository) => _bookingRepository = bookingRepository;

    [HttpGet("bookings")]
    public async Task<IActionResult> BookingsReport(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] string? status,
        [FromQuery] string format = "json",
        CancellationToken cancellationToken = default)
    {
        var request = new BookingSearchRequest
        {
            Page = 1,
            PageSize = 5000,
            Status = status,
            BookingDateFrom = from.HasValue ? DateOnly.FromDateTime(from.Value) : null,
            BookingDateTo = to.HasValue ? DateOnly.FromDateTime(to.Value) : null,
            SortBy = "bookingDate",
            SortOrder = "desc"
        };

        var items = await _bookingRepository.ListForExportAsync(request, 5000, cancellationToken);
        var rows = items.Select(b => new
        {
            b.Id,
            b.UserId,
            b.ReferenceCode,
            b.BookingType,
            b.Provider,
            b.Amount,
            b.Currency,
            b.Status,
            b.BookingDate,
            b.CreatedAt
        }).ToList();

        var normalized = (format ?? "json").Trim().ToLowerInvariant();
        if (normalized == "json")
            return Ok(new { total = rows.Count, items = rows });

        var headers = new[] { "Id", "UserId", "ReferenceCode", "Type", "Provider", "Amount", "Currency", "Status", "BookingDate", "CreatedAt" };
        var tableRows = items.Select(b => new[]
        {
            b.Id.ToString(),
            b.UserId.ToString(),
            b.ReferenceCode,
            b.BookingType,
            b.Provider,
            (b.Amount ?? 0m).ToString(System.Globalization.CultureInfo.InvariantCulture),
            b.Currency ?? "",
            b.Status,
            b.BookingDate.ToString("yyyy-MM-dd"),
            b.CreatedAt.ToString("O")
        }).ToList();

        return normalized switch
        {
            "csv" => File(TabularExport.ToCsv(headers, tableRows), "text/csv", $"bookings-report-{DateTime.UtcNow:yyyyMMdd}.csv"),
            "xlsx" => File(
                TabularExport.ToXlsx("Bookings", headers, tableRows),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"bookings-report-{DateTime.UtcNow:yyyyMMdd}.xlsx"),
            _ => Ok(new { total = rows.Count, items = rows })
        };
    }
}
