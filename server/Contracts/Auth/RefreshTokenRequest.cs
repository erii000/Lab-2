using System.ComponentModel.DataAnnotations;

namespace SmartTravelAssistant.API.Contracts.Auth;

public sealed class RefreshTokenRequest
{
    [Required]
    public string RefreshToken { get; set; } = string.Empty;
}
