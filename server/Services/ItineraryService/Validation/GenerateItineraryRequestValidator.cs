using FluentValidation;
using TravelAssistant.Services.ItineraryService.DTOs.Itineraries;

namespace TravelAssistant.Services.ItineraryService.Validation;

public sealed class GenerateItineraryRequestValidator : AbstractValidator<GenerateItineraryRequest>
{
    public GenerateItineraryRequestValidator()
    {
        RuleFor(x => x.Destination).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Country).MaximumLength(100);
        RuleFor(x => x.BudgetLevel).MaximumLength(50);
        RuleFor(x => x.TransportMode).MaximumLength(50);
        RuleFor(x => x.TripTitle).MaximumLength(100);
        RuleFor(x => x).Custom((r, ctx) =>
        {
            if (r.EndDate < r.StartDate)
            {
                ctx.AddFailure(nameof(r.EndDate), "End date must be on or after the start date.");
                return;
            }

            var inclusiveDays = r.EndDate.DayNumber - r.StartDate.DayNumber + 1;
            if (inclusiveDays > 31)
                ctx.AddFailure(nameof(r.EndDate), "Trip length cannot exceed 31 days.");
        });
    }
}
