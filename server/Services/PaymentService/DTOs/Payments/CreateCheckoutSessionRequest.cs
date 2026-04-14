namespace TravelAssistant.Services.PaymentService.DTOs.Payments;

/// <summary>
/// Contract fields from <c>API_CONTRACT_SPRINT1.md</c> plus <see cref="Amount"/> / <see cref="Currency"/>
/// until a booking quote is resolved server-side from BookingService.
/// </summary>
public sealed class CreateCheckoutSessionRequest
{
    public int BookingId { get; set; }
    public string PaymentProvider { get; set; } = "Stripe";
    public string SuccessUrl { get; set; } = string.Empty;
    public string CancelUrl { get; set; } = string.Empty;
    public decimal? Amount { get; set; }
    public string? Currency { get; set; }
}
