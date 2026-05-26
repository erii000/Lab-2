namespace TravelAssistant.Services.PaymentService.DTOs.Payments;

public sealed class CreateCheckoutSessionResponse
{
    public string PaymentId { get; init; } = string.Empty;
    public string? CheckoutUrl { get; init; }
    public string? Status { get; init; }
    public string? ExternalReference { get; init; }
}
