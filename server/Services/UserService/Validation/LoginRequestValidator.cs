using FluentValidation;
using TravelAssistant.Services.UserService.Contracts.Auth;

namespace TravelAssistant.Services.UserService.Validation;

public sealed class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty();
    }
}
