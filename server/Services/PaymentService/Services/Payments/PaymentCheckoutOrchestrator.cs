using TravelAssistant.Services.PaymentService.DTOs.Payments;

namespace TravelAssistant.Services.PaymentService.Services.Payments;

public sealed class PaymentCheckoutOrchestrator : IPaymentCheckoutService
{
    private readonly StripePaymentCheckoutService _stripePaymentCheckoutService;
    private readonly PayPalCheckoutService _payPalCheckoutService;

    public PaymentCheckoutOrchestrator(
        StripePaymentCheckoutService stripePaymentCheckoutService,
        PayPalCheckoutService payPalCheckoutService)
    {
        _stripePaymentCheckoutService = stripePaymentCheckoutService;
        _payPalCheckoutService = payPalCheckoutService;
    }

    public Task<CreateCheckoutSessionResponse> CreateCheckoutAsync(
        int userId,
        CreateCheckoutSessionRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.Equals(request.PaymentProvider, "Stripe", StringComparison.OrdinalIgnoreCase))
            return _stripePaymentCheckoutService.CreateCheckoutAsync(userId, request, cancellationToken);

        if (string.Equals(request.PaymentProvider, "PayPal", StringComparison.OrdinalIgnoreCase))
            return _payPalCheckoutService.CreateCheckoutAsync(userId, request, cancellationToken);

        throw new NotSupportedException($"Payment provider '{request.PaymentProvider}' is not supported.");
    }
}
