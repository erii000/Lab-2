using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace TravelAssistant.Services.BookingService.Security;

public static class ClaimsPrincipalExtensions
{
    public static int? GetUserId(this ClaimsPrincipal principal)
    {
        var value = principal.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? principal.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(value, out var id) ? id : null;
    }

    public static bool IsAdmin(this ClaimsPrincipal principal) => principal.IsInRole("Admin");

    public static bool CanManageBookingLifecycle(this ClaimsPrincipal principal) =>
        principal.IsInRole("Admin") || principal.IsInRole("Support") || principal.IsInRole("System");
}
