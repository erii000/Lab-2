using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Stripe;
using Stripe.Checkout;
using TravelAssistant.Services.PaymentService.Configuration;
using TravelAssistant.Services.PaymentService.Models.Entities;
using TravelAssistant.Services.PaymentService.Repositories;

namespace TravelAssistant.Services.PaymentService.Services.Payments;

public sealed class StripePaymentWebhookService : IPaymentWebhookService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly StripeOptions _stripeOptions;

    public StripePaymentWebhookService(
        IPaymentRepository paymentRepository,
        IOptions<StripeOptions> stripeOptions)
    {
        _paymentRepository = paymentRepository;
        _stripeOptions = stripeOptions.Value;
    }

    public async Task<bool> ProcessStripeEventAsync(string json, string signatureHeader, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(_stripeOptions.SecretKey))
            throw new InvalidOperationException("Stripe SecretKey is not configured.");

        StripeConfiguration.ApiKey = _stripeOptions.SecretKey;

        if (string.IsNullOrWhiteSpace(_stripeOptions.WebhookSecret))
            return false;

        Event stripeEvent;
        try
        {
            stripeEvent = EventUtility.ConstructEvent(
                json,
                signatureHeader,
                _stripeOptions.WebhookSecret,
                throwOnApiVersionMismatch: false);
        }
        catch (StripeException)
        {
            return false;
        }

        if (await _paymentRepository.LogExistsForEventAsync(stripeEvent.Id, cancellationToken))
            return true;

        int? paymentIdHint = null;
        if (stripeEvent.Data.Object is Session sessionEarly
            && sessionEarly.Metadata is not null
            && sessionEarly.Metadata.TryGetValue("paymentId", out var pidEarly)
            && int.TryParse(pidEarly, out var parsedEarly))
        {
            paymentIdHint = parsedEarly;
        }

        var log = new PaymentTransactionLog
        {
            PaymentId = paymentIdHint,
            Provider = "stripe",
            ExternalEventId = stripeEvent.Id,
            EventType = stripeEvent.Type,
            Payload = json,
            ProcessedOk = false,
            ErrorMessage = null,
            CreatedAt = DateTime.UtcNow
        };

        try
        {
            if (string.Equals(stripeEvent.Type, "checkout.session.completed", StringComparison.Ordinal)
                && stripeEvent.Data.Object is Session session)
                await HandleCheckoutSessionCompletedAsync(session, cancellationToken);

            log.ProcessedOk = true;
        }
        catch (Exception ex)
        {
            log.ProcessedOk = false;
            log.ErrorMessage = ex.Message;
        }

        try
        {
            await _paymentRepository.AddLogAsync(log, cancellationToken);
            await _paymentRepository.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            if (await _paymentRepository.LogExistsForEventAsync(stripeEvent.Id, cancellationToken))
                return true;

            throw;
        }

        return true;
    }

    private async Task HandleCheckoutSessionCompletedAsync(Session session, CancellationToken cancellationToken)
    {
        if (session.Metadata is null || !session.Metadata.TryGetValue("paymentId", out var paymentIdRaw))
            return;

        if (!int.TryParse(paymentIdRaw, out var paymentId))
            return;

        var payment = await _paymentRepository.GetTrackedByIdAsync(paymentId, cancellationToken);
        if (payment is null)
            return;

        payment.PaymentStatus = "Paid";
        payment.PaidAt = DateTime.UtcNow;
        payment.ExternalReference = session.Id;
        await _paymentRepository.SaveChangesAsync(cancellationToken);
    }
}
