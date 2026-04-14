using FluentValidation;
using TravelAssistant.Services.BookingService.DTOs.Bookings;

namespace TravelAssistant.Services.BookingService.Validation;

public sealed class UpdateBookingStatusRequestValidator : AbstractValidator<UpdateBookingStatusRequest>
{
    public UpdateBookingStatusRequestValidator()
    {
        RuleFor(x => x.Status).NotEmpty().MaximumLength(50);
    }
}
