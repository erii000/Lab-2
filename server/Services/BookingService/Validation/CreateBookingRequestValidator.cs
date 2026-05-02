using FluentValidation;
using TravelAssistant.Services.BookingService.DTOs.Bookings;

namespace TravelAssistant.Services.BookingService.Validation;

public sealed class CreateBookingRequestValidator : AbstractValidator<CreateBookingRequest>
{
    public CreateBookingRequestValidator()
    {
        RuleFor(x => x.ItineraryId)
            .NotNull()
            .GreaterThan(0)
            .WithMessage("ItineraryId is required and must be greater than zero.");
        RuleFor(x => x.Provider).NotEmpty().MaximumLength(100);
        RuleFor(x => x.BookingType).NotEmpty().MaximumLength(50);
        RuleFor(x => x.ReferenceCode).NotEmpty().MaximumLength(100);
        RuleFor(x => x.Currency).MaximumLength(10);
        RuleFor(x => x.Amount).GreaterThanOrEqualTo(0).When(x => x.Amount.HasValue);
    }
}
