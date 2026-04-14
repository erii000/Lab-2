namespace TravelAssistant.Services.BookingService.Domain;

public static class BookingStatusTransitions
{
    private static readonly Dictionary<string, HashSet<string>> Allowed = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Pending"] = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Confirmed", "Cancelled" },
        ["Confirmed"] = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Completed", "Cancelled" },
        ["Completed"] = new HashSet<string>(StringComparer.OrdinalIgnoreCase),
        ["Cancelled"] = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    };

    public static bool IsAllowed(string currentStatus, string nextStatus)
    {
        if (string.Equals(currentStatus, nextStatus, StringComparison.OrdinalIgnoreCase))
            return true;

        if (!Allowed.TryGetValue(currentStatus, out var targets))
            return false;

        return targets.Contains(nextStatus);
    }
}
