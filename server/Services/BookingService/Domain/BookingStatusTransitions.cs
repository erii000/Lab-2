namespace TravelAssistant.Services.BookingService.Domain;

public static class BookingStatusTransitions
{
    private static readonly Dictionary<string, HashSet<string>> Allowed = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Pending"] = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Confirmed", "Cancelled" },
        ["Confirmed"] = new HashSet<string>(StringComparer.OrdinalIgnoreCase) { "Completed", "Cancelled", "Refunded", "PartiallyRefunded" },
        ["Completed"] = new HashSet<string>(StringComparer.OrdinalIgnoreCase),
        ["Cancelled"] = new HashSet<string>(StringComparer.OrdinalIgnoreCase),
        ["Refunded"] = new HashSet<string>(StringComparer.OrdinalIgnoreCase),
        ["PartiallyRefunded"] = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
    };

    public static bool IsAllowed(string currentStatus, string nextStatus)
    {
        if (!Allowed.TryGetValue(currentStatus, out var targets))
            return false;

        return targets.Contains(nextStatus);
    }
}
