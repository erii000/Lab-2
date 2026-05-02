using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;
using TravelAssistant.Services.PaymentService.Configuration;
using TravelAssistant.Services.PaymentService.DTOs.Payments;
using TravelAssistant.Services.PaymentService.Models.Entities;
using TravelAssistant.Services.PaymentService.Repositories;

namespace TravelAssistant.Services.PaymentService.Services.Payments;

public sealed class StripePaymentCheckoutService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly StripeOptions _stripeOptions;

    public StripePaymentCheckoutService(
        IPaymentRepository paymentRepository,
        IOptions<StripeOptions> stripeOptions)
    {
        _paymentRepository = paymentRepository;
        _stripeOptions = stripeOptions.Value;
    }

    public async Task<CreateCheckoutSessionResponse> CreateCheckoutAsync(
        int userId,
        CreateCheckoutSessionRequest request,
        CancellationToken cancellationToken = default)
    {
        Payment? payment = null;
        try
        {
            if (string.IsNullOrWhiteSpace(_stripeOptions.SecretKey))
                throw new InvalidOperationException("Stripe SecretKey is not configured.");

            StripeConfiguration.ApiKey = _stripeOptions.SecretKey;

            var amount = request.Amount!.Value;
            var currency = request.Currency!.Trim().ToLowerInvariant();

            payment = new Payment
            {
                UserId = userId,
                BookingId = request.BookingId,
                Amount = amount,
                Currency = currency.ToUpperInvariant(),
                PaymentMethod = "stripe",
                PaymentStatus = "PendingCheckout",
                CreatedAt = DateTime.UtcNow
            };

            await _paymentRepository.AddAsync(payment, cancellationToken);
            await _paymentRepository.SaveChangesAsync(cancellationToken);

            var unitAmount = (long)Math.Round(amount * 100m, MidpointRounding.AwayFromZero);
            if (unitAmount <= 0)
                throw new InvalidOperationException("Checkout amount rounds to zero cents.");

            var options = new SessionCreateOptions
            {
                Mode = "payment",
                SuccessUrl = request.SuccessUrl,
                CancelUrl = request.CancelUrl,
                ClientReferenceId = payment.Id.ToString(),
                Metadata = new Dictionary<string, string>
                {
                    ["paymentId"] = payment.Id.ToString(),
                    ["userId"] = userId.ToString(),
                    ["bookingId"] = request.BookingId.ToString()
                },
                LineItems = new List<SessionLineItemOptions>
                {
                    new SessionLineItemOptions
                    {
                        Quantity = 1,
                        PriceData = new SessionLineItemPriceDataOptions
                        {
                            Currency = currency,
                            UnitAmount = unitAmount,
                            ProductData = new SessionLineItemPriceDataProductDataOptions
                            {
                                Name = $"Travel booking #{request.BookingId}"
                            }
                        }
                    }
                }
            };

            var service = new SessionService();
            var session = await service.CreateAsync(options, cancellationToken: cancellationToken);

            payment = (await _paymentRepository.GetTrackedByIdAsync(payment.Id, cancellationToken))!;
            payment.ExternalReference = session.Id;
            payment.PaymentStatus = "AwaitingPayment";
            await _paymentRepository.SaveChangesAsync(cancellationToken);

            return new CreateCheckoutSessionResponse
            {
                PaymentId = payment.Id.ToString(),
                CheckoutUrl = session.Url
            };
        }
        catch (Exception ex)
        {
            var log = new PaymentTransactionLog
            {
                PaymentId = payment?.Id,
                Provider = "stripe",
                ExternalEventId = $"stripe-checkout-{Guid.NewGuid():N}",
                EventType = "checkout.create",
                ProcessedOk = false,
                ErrorMessage = ex.Message,
                CreatedAt = DateTime.UtcNow
            };
            await _paymentRepository.AddLogAsync(log, cancellationToken);
            await _paymentRepository.SaveChangesAsync(cancellationToken);
            throw;
        }
    }
}
