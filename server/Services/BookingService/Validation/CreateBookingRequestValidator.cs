using FluentValidation;
using TravelAssistant.Services.BookingService.DTOs.Bookings;

namespace TravelAssistant.Services.BookingService.Validation;

public sealed class CreateBookingRequestValidator : AbstractValidator<CreateBookingRequest>
{
    public CreateBookingRequestValidator()
    {
        RuleFor(x => x.ItineraryId)
            .GreaterThan(0)
            .When(x => x.ItineraryId.HasValue)
            .WithMessage("ItineraryId must be greater than zero when provided.");
        RuleFor(x => x.Provider).NotEmpty().MaximumLength(100);
        RuleFor(x => x.BookingType).NotEmpty().MaximumLength(50);
        RuleFor(x => x.ReferenceCode).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Currency).MaximumLength(10);
        RuleFor(x => x.Amount).GreaterThanOrEqualTo(0).When(x => x.Amount.HasValue);
    }
}
