namespace TravelAssistant.Services.PaymentService.Services.Payments;

public interface IPaymentWebhookService
{
    /// <summary>
    /// Returns false when the Stripe signature cannot be verified (caller should respond 400).
    /// </summary>
    Task<bool> ProcessStripeEventAsync(string json, string signatureHeader, CancellationToken cancellationToken = default);
}
