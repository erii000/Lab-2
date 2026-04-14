using TravelAssistant.Services.PaymentService.DTOs.Payments;

namespace TravelAssistant.Services.PaymentService.Services.Payments;

public sealed class PaymentCheckoutOrchestrator : IPaymentCheckoutService
{
    private readonly StripePaymentCheckoutService _stripePaymentCheckoutService;

    public PaymentCheckoutOrchestrator(StripePaymentCheckoutService stripePaymentCheckoutService) =>
        _stripePaymentCheckoutService = stripePaymentCheckoutService;

    public Task<CreateCheckoutSessionResponse> CreateCheckoutAsync(
        int userId,
        CreateCheckoutSessionRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.Equals(request.PaymentProvider, "Stripe", StringComparison.OrdinalIgnoreCase))
            return _stripePaymentCheckoutService.CreateCheckoutAsync(userId, request, cancellationToken);

        if (string.Equals(request.PaymentProvider, "PayPal", StringComparison.OrdinalIgnoreCase))
            throw new NotSupportedException("PayPal checkout is not wired in this deployment. Use Stripe or extend PaymentCheckoutOrchestrator.");

        throw new NotSupportedException($"Payment provider '{request.PaymentProvider}' is not supported.");
    }
}
