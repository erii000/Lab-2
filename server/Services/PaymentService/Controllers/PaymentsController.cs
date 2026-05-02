using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelAssistant.Services.PaymentService.DTOs.Payments;
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
