using TravelAssistant.Common.Audit;
using TravelAssistant.Common.Notifications;
using TravelAssistant.Services.PaymentService.DTOs.Payments;
using TravelAssistant.Services.PaymentService.Models.Entities;
using TravelAssistant.Services.PaymentService.Repositories;

namespace TravelAssistant.Services.PaymentService.Services.Payments;

/// <summary>
/// Local/dev checkout when Stripe/PayPal keys are not configured — records a completed payment in the database.
/// </summary>
public sealed class LabPaymentCheckoutService
{
    private readonly IPaymentRepository _paymentRepository;
    private readonly IAuditWriter _auditWriter;
    private readonly ITravelUpdatePublisher _travelUpdatePublisher;

    public LabPaymentCheckoutService(
        IPaymentRepository paymentRepository,
        IAuditWriter auditWriter,
        ITravelUpdatePublisher travelUpdatePublisher)
    {
        _paymentRepository = paymentRepository;
        _auditWriter = auditWriter;
        _travelUpdatePublisher = travelUpdatePublisher;
    }

    public async Task<CreateCheckoutSessionResponse> CreateCheckoutAsync(
        int userId,
        CreateCheckoutSessionRequest request,
        CancellationToken cancellationToken = default)
    {
        if (request.Amount is null or <= 0)
            throw new InvalidOperationException("Checkout amount is required.");

        var amount = request.Amount.Value;
        var currency = string.IsNullOrWhiteSpace(request.Currency)
            ? "EUR"
            : request.Currency.Trim().ToUpperInvariant();

        var payment = new Payment
        {
            UserId = userId,
            BookingId = request.BookingId,
            Amount = amount,
            Currency = currency,
            PaymentMethod = "lab",
            PaymentStatus = "Completed",
            ExternalReference = $"LAB-{Guid.NewGuid():N}"[..16].ToUpperInvariant(),
            PaidAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        await _paymentRepository.AddAsync(payment, cancellationToken);
        await _paymentRepository.SaveChangesAsync(cancellationToken);
        await _auditWriter.WriteAsync(userId, "CheckoutCompleted", "Payment", $"Payment {payment.Id} lab {amount} {currency}", cancellationToken);
        await _travelUpdatePublisher.NotifyUserAsync(
            userId,
            "Payment received",
            $"Payment of {amount} {currency} completed.",
            "payment",
            cancellationToken);
        await _travelUpdatePublisher.BroadcastAsync(
            "Payment received",
            $"Booking {request.BookingId} paid ({amount} {currency}).",
            "payment",
            cancellationToken);

        return new CreateCheckoutSessionResponse
        {
            PaymentId = payment.Id.ToString(),
            CheckoutUrl = null,
            Status = "Completed",
            ExternalReference = payment.ExternalReference
        };
    }
}
