using System.ComponentModel.DataAnnotations;

namespace TravelAssistant.Services.UserService.Contracts.Auth;

public sealed class RegisterRequest
{
    [Required]
    [MaxLength(50)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(50)]
    public string? Surname { get; set; }

    [Required]
    [EmailAddress]
    [MaxLength(120)]
    public string Email { get; set; } = string.Empty;

    [Required]
    [MinLength(8)]
    [MaxLength(100)]
    public string Password { get; set; } = string.Empty;
}

