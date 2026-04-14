using FluentValidation;
using TravelAssistant.Services.PaymentService.DTOs.Payments;

namespace TravelAssistant.Services.PaymentService.Validation;

public sealed class CreateCheckoutSessionRequestValidator : AbstractValidator<CreateCheckoutSessionRequest>
{
    public CreateCheckoutSessionRequestValidator()
    {
        RuleFor(x => x.BookingId).GreaterThan(0);
        RuleFor(x => x.PaymentProvider).NotEmpty().MaximumLength(50);
        RuleFor(x => x.SuccessUrl).NotEmpty().MaximumLength(2000).Must(u => Uri.TryCreate(u, UriKind.Absolute, out _))
            .WithMessage("SuccessUrl must be an absolute URL.");
        RuleFor(x => x.CancelUrl).NotEmpty().MaximumLength(2000).Must(u => Uri.TryCreate(u, UriKind.Absolute, out _))
            .WithMessage("CancelUrl must be an absolute URL.");
        RuleFor(x => x.Currency).MaximumLength(10);

        RuleFor(x => x.Amount)
            .NotNull()
            .GreaterThan(0)
            .When(x =>
                string.Equals(x.PaymentProvider, "Stripe", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(x.PaymentProvider, "PayPal", StringComparison.OrdinalIgnoreCase))
            .WithMessage("Amount is required for Stripe/PayPal until booking totals are integrated.");

        RuleFor(x => x.Currency)
            .NotEmpty()
            .When(x =>
                string.Equals(x.PaymentProvider, "Stripe", StringComparison.OrdinalIgnoreCase) ||
                string.Equals(x.PaymentProvider, "PayPal", StringComparison.OrdinalIgnoreCase));
    }
}
