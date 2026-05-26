namespace TravelAssistant.Services.UserService.Contracts.Auth;

public sealed class LogoutRequest
{
    public string? RefreshToken { get; set; }
}
