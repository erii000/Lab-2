using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelAssistant.Common.Export;
using TravelAssistant.Services.PaymentService.DTOs.Payments;
using TravelAssistant.Services.PaymentService.Models.Entities;
using TravelAssistant.Services.PaymentService.Repositories;
using TravelAssistant.Services.PaymentService.Security;
using TravelAssistant.Services.PaymentService.Services.Payments;

namespace TravelAssistant.Services.PaymentService.Controllers;

[ApiController]
[Route("api/v1/payments")]
public sealed class PaymentsController : ControllerBase
{
    private readonly IPaymentCheckoutService _paymentCheckoutService;
    private readonly IPaymentWebhookService _paymentWebhookService;
    private readonly IPaymentRepository _paymentRepository;

    public PaymentsController(
        IPaymentCheckoutService paymentCheckoutService,
        IPaymentWebhookService paymentWebhookService,
        IPaymentRepository paymentRepository)
    {
        _paymentCheckoutService = paymentCheckoutService;
        _paymentWebhookService = paymentWebhookService;
        _paymentRepository = paymentRepository;
    }

    [HttpGet("search")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Search([FromQuery] PaymentSearchRequest request, CancellationToken cancellationToken)
    {
        var (items, total) = await _paymentRepository.SearchAsync(request, cancellationToken);
        var mapped = items.Select(PaymentQueryService.ToDto).ToList();
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
    public async Task<IActionResult> Export([FromQuery] string format = "json", [FromQuery] PaymentSearchRequest? filters = null, CancellationToken cancellationToken = default)
    {
        filters ??= new PaymentSearchRequest();
        var items = await _paymentRepository.ListForExportAsync(filters, 5000, cancellationToken);
        var headers = new[]
        {
            "Id", "UserId", "BookingId", "Amount", "Currency", "PaymentMethod", "PaymentStatus", "ExternalReference", "PaidAt", "CreatedAt"
        };
        var rows = items.Select(p => new[]
        {
            p.Id.ToString(),
            p.UserId.ToString(),
            p.BookingId.ToString(),
            p.Amount.ToString(System.Globalization.CultureInfo.InvariantCulture),
            p.Currency ?? "",
            p.PaymentMethod,
            p.PaymentStatus,
            p.ExternalReference ?? "",
            p.PaidAt?.ToString("O") ?? "",
            p.CreatedAt.ToString("O")
        }).ToList();

        var normalized = (format ?? "json").Trim().ToLowerInvariant();
        return normalized switch
        {
            "csv" => File(TabularExport.ToCsv(headers, rows), "text/csv", $"payments-{DateTime.UtcNow:yyyyMMdd}.csv"),
            "xlsx" => File(
                TabularExport.ToXlsx("Payments", headers, rows),
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                $"payments-{DateTime.UtcNow:yyyyMMdd}.xlsx"),
            _ => File(TabularExport.ToJsonUtf8(items.Select(PaymentQueryService.ToDto)), "application/json", $"payments-{DateTime.UtcNow:yyyyMMdd}.json")
        };
    }

    public sealed class PaymentImportRow
    {
        public int UserId { get; set; }
        public int BookingId { get; set; }
        public decimal Amount { get; set; }
        public string? Currency { get; set; }
        public string PaymentMethod { get; set; } = "";
        public string PaymentStatus { get; set; } = "";
        public string? ExternalReference { get; set; }
    }

    [HttpPost("import")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Import([FromBody] IReadOnlyList<PaymentImportRow>? rows, CancellationToken cancellationToken)
    {
        if (rows is null || rows.Count == 0)
            return BadRequest(new { error = "Empty payload." });

        var errors = new List<object>();
        var entities = new List<Payment>();
        for (var i = 0; i < rows.Count; i++)
        {
            var r = rows[i];
            if (r.UserId <= 0 || r.BookingId <= 0 || string.IsNullOrWhiteSpace(r.PaymentMethod) ||
                string.IsNullOrWhiteSpace(r.PaymentStatus))
                errors.Add(new { row = i + 1, message = "UserId, BookingId, PaymentMethod, and PaymentStatus are required." });
            else
                entities.Add(new Payment
                {
                    UserId = r.UserId,
                    BookingId = r.BookingId,
                    Amount = r.Amount,
                    Currency = string.IsNullOrWhiteSpace(r.Currency) ? null : r.Currency.Trim().ToUpperInvariant(),
                    PaymentMethod = r.PaymentMethod.Trim(),
                    PaymentStatus = r.PaymentStatus.Trim(),
                    ExternalReference = string.IsNullOrWhiteSpace(r.ExternalReference) ? null : r.ExternalReference.Trim(),
                    CreatedAt = DateTime.UtcNow
                });
        }

        if (errors.Count > 0)
            return BadRequest(new { errors });

        foreach (var p in entities)
            await _paymentRepository.AddAsync(p, cancellationToken);

        await _paymentRepository.SaveChangesAsync(cancellationToken);
        return Ok(new { inserted = entities.Count });
    }

    [HttpPost("checkout")]
    [Authorize]
    [ProducesResponseType(typeof(CreateCheckoutSessionResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status422UnprocessableEntity)]
    public async Task<ActionResult<CreateCheckoutSessionResponse>> Checkout(
        [FromBody] CreateCheckoutSessionRequest request,
        CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
            return Unauthorized();

        try
        {
            var response = await _paymentCheckoutService.CreateCheckoutAsync(userId.Value, request, cancellationToken);
            return Ok(response);
        }
        catch (NotSupportedException ex)
        {
            return UnprocessableEntity(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("webhook")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> StripeWebhook(CancellationToken cancellationToken)
    {
        using var reader = new StreamReader(Request.Body);
        var json = await reader.ReadToEndAsync(cancellationToken);
        var signature = Request.Headers["Stripe-Signature"].ToString();
        if (string.IsNullOrEmpty(signature))
            return BadRequest(new { error = "Missing Stripe-Signature header." });

        var ok = await _paymentWebhookService.ProcessStripeEventAsync(json, signature, cancellationToken);
        return ok ? Ok() : BadRequest(new { error = "Invalid Stripe signature or webhook configuration." });
    }

    [HttpPost("webhook/paypal")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> PayPalWebhook(CancellationToken cancellationToken)
    {
        using var reader = new StreamReader(Request.Body);
        var json = await reader.ReadToEndAsync(cancellationToken);
        var ok = await _paymentWebhookService.ProcessPayPalEventAsync(json, Request.Headers, cancellationToken);
        return ok ? Ok() : BadRequest(new { error = "Invalid PayPal signature or webhook configuration." });
    }

    [HttpGet("{paymentId:int}")]
    [Authorize]
    [ProducesResponseType(typeof(PaymentDetailResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<PaymentDetailResponse>> GetById(int paymentId, CancellationToken cancellationToken)
    {
        var userId = User.GetUserId();
        if (userId is null)
            return Unauthorized();

        var payment = await _paymentRepository.GetByIdAsync(paymentId, cancellationToken);
        if (payment is null)
            return NotFound();

        if (!User.IsAdmin() && payment.UserId != userId.Value)
            return Forbid();

        return Ok(PaymentQueryService.ToDto(payment));
    }

    [HttpGet("user/{userId:int}")]
    [Authorize]
    [ProducesResponseType(typeof(IReadOnlyList<PaymentDetailResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<PaymentDetailResponse>>> ListForUser(
        int userId,
        CancellationToken cancellationToken)
    {
        var requester = User.GetUserId();
        if (requester is null)
            return Unauthorized();

        if (!User.IsAdmin() && requester.Value != userId)
            return Forbid();

        var rows = await _paymentRepository.ListByUserAsync(userId, cancellationToken);
        var dto = rows.Select(PaymentQueryService.ToDto).ToList();
        return Ok(dto);
    }
}
