using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;
using TravelAssistant.Services.BookingService.Data;

namespace TravelAssistant.Services.BookingService.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/diagnostics")]
public sealed class DiagnosticsController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IWebHostEnvironment _environment;
    private readonly IConfiguration _configuration;

    public DiagnosticsController(
        ApplicationDbContext dbContext,
        IWebHostEnvironment environment,
        IConfiguration configuration)
    {
        _dbContext = dbContext;
        _environment = environment;
        _configuration = configuration;
    }

    [HttpGet("db")]
    public async Task<IActionResult> DbStatus(CancellationToken cancellationToken)
    {
        string? dataSource = null;
        string? initialCatalog = null;
        var configured = _configuration.GetConnectionString("DefaultConnection");
        if (!string.IsNullOrWhiteSpace(configured))
        {
            try
            {
                var sb = new SqlConnectionStringBuilder(configured);
                dataSource = sb.DataSource;
                initialCatalog = sb.InitialCatalog;
            }
            catch
            {
                // ignore parse errors
            }
        }

        try
        {
            await _dbContext.Database.OpenConnectionAsync(cancellationToken);
            await _dbContext.Database.CloseConnectionAsync();
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                status = "down",
                service = "BookingService",
                database = "unreachable",
                dataSource,
                initialCatalog,
                hint = "Common causes: Azure SQL firewall (add your client IP), wrong password, or SSL/TLS. Try TrustServerCertificate=True only to isolate cert issues.",
                error = _environment.IsDevelopment() ? ex.Message : "See server logs.",
                errorType = ex.GetType().Name
            });
        }

        var canConnect = await _dbContext.Database.CanConnectAsync(cancellationToken);
        if (!canConnect)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable, new
            {
                status = "down",
                service = "BookingService",
                database = "unreachable",
                hint = "CanConnectAsync returned false after OpenConnection succeeded; check EF configuration."
            });
        }

        var bookings = await _dbContext.Bookings.CountAsync(cancellationToken);
        var hotels = await _dbContext.Hotels.CountAsync(cancellationToken);
        var flights = await _dbContext.Flights.CountAsync(cancellationToken);
        var transportOptions = await _dbContext.TransportOptions.CountAsync(cancellationToken);
        var savedTrips = await _dbContext.SavedTrips.CountAsync(cancellationToken);

        return Ok(new
        {
            status = "up",
            service = "BookingService",
            database = "connected",
            dataSource,
            initialCatalog,
            counts = new { bookings, hotels, flights, transportOptions, savedTrips }
        });
    }
}
