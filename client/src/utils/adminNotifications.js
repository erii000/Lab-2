const MINUTE = 60_000;
const HOUR = 3_600_000;
const DAY = 86_400_000;

export function formatNotificationTime(timestamp) {
  const diff = Date.now() - timestamp;
  if (diff < MINUTE) return "Just now";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)}m ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)}h ago`;
  if (diff < DAY * 7) return `${Math.floor(diff / DAY)}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export const NOTIFICATION_TYPE_LABELS = {
  booking: "Booking",
  trip: "Trip",
  user: "User",
  system: "System",
};
