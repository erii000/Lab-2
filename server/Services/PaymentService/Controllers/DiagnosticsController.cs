using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using TravelAssistant.Services.PaymentService.Data;

namespace TravelAssistant.Services.PaymentService.Controllers;

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
                service = "PaymentService",
                database = "unreachable",
                dataSource,
                initialCatalog,
                hint = "Common causes: Azure SQL firewall (add your client IP), wrong password, or SSL/TLS.",
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
                service = "PaymentService",
                database = "unreachable",
                dataSource,
                initialCatalog
            });
        }

        var payments = await _dbContext.Payments.CountAsync(cancellationToken);
        var expenses = await _dbContext.Expenses.CountAsync(cancellationToken);

        return Ok(new
        {
            status = "up",
            service = "PaymentService",
            database = "connected",
            dataSource,
            initialCatalog,
            counts = new { payments, expenses }
        });
    }
}
