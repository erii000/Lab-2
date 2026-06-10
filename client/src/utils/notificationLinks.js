/** Resolve a traveler booking details URL from a notification payload. */
export function bookingLinkFromNotification({ type, bookingId, bookingServerId, message }) {
  if ((type ?? "").toLowerCase() !== "booking") return null;

  const serverId = bookingServerId ?? bookingId;
  if (serverId != null && String(serverId).trim()) {
    return `/bookings/${serverId}`;
  }

  const refMatch = String(message ?? "").match(/\b(bk_[a-z0-9_]+)\b/i);
  if (refMatch) return `/bookings/${refMatch[1]}`;

  return "/bookings";
}

export function supportLinkFromNotification({ type }) {
  if ((type ?? "").toLowerCase() === "support") return "/contact";
  return null;
}
