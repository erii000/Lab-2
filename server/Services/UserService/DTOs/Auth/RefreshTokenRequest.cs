using System.ComponentModel.DataAnnotations;

namespace TravelAssistant.Services.UserService.Contracts.Auth;

public sealed class RefreshTokenRequest
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}

