using Microsoft.Extensions.Options;
using TravelAssistant.Services.PaymentService.Configuration;
using TravelAssistant.Services.PaymentService.DTOs.Payments;

namespace TravelAssistant.Services.PaymentService.Services.Payments;

public sealed class PaymentCheckoutOrchestrator : IPaymentCheckoutService
{
    private readonly StripePaymentCheckoutService _stripePaymentCheckoutService;
    private readonly PayPalCheckoutService _payPalCheckoutService;
    private readonly LabPaymentCheckoutService _labPaymentCheckoutService;
    private readonly StripeOptions _stripeOptions;
    private readonly PayPalOptions _payPalOptions;

    public PaymentCheckoutOrchestrator(
        StripePaymentCheckoutService stripePaymentCheckoutService,
        PayPalCheckoutService payPalCheckoutService,
        LabPaymentCheckoutService labPaymentCheckoutService,
        IOptions<StripeOptions> stripeOptions,
        IOptions<PayPalOptions> payPalOptions)
    {
        _stripePaymentCheckoutService = stripePaymentCheckoutService;
        _payPalCheckoutService = payPalCheckoutService;
        _labPaymentCheckoutService = labPaymentCheckoutService;
        _stripeOptions = stripeOptions.Value;
        _payPalOptions = payPalOptions.Value;
    }

    public async Task<CreateCheckoutSessionResponse> CreateCheckoutAsync(
        int userId,
        CreateCheckoutSessionRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.Equals(request.PaymentProvider, "Lab", StringComparison.OrdinalIgnoreCase))
            return await _labPaymentCheckoutService.CreateCheckoutAsync(userId, request, cancellationToken);

        if (string.Equals(request.PaymentProvider, "Stripe", StringComparison.OrdinalIgnoreCase)
            && !string.IsNullOrWhiteSpace(_stripeOptions.SecretKey))
        {
            return await _stripePaymentCheckoutService.CreateCheckoutAsync(userId, request, cancellationToken);
        }

        if (string.Equals(request.PaymentProvider, "PayPal", StringComparison.OrdinalIgnoreCase)
            && !string.IsNullOrWhiteSpace(_payPalOptions.ClientId)
            && !string.IsNullOrWhiteSpace(_payPalOptions.ClientSecret))
        {
            return await _payPalCheckoutService.CreateCheckoutAsync(userId, request, cancellationToken);
        }

        return await _labPaymentCheckoutService.CreateCheckoutAsync(userId, request, cancellationToken);
    }
}
