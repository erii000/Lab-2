/** Build admin-facing copy from a SignalR / API notification payload. */
export function toAdminNotificationView(payload) {
  const bookingId = payload.bookingId ?? payload.BookingId;
  const title = payload.title ?? payload.Title ?? "Live update";
  const message = payload.message ?? payload.Message ?? "";
  const type = (payload.type ?? payload.Type ?? "system").toLowerCase();

  if (type === "support") {
    let chatUserId = payload.targetUserId ?? payload.TargetUserId ?? null;
    if (chatUserId == null) {
      const match = String(message).match(/User #(\d+)/i);
      if (match) chatUserId = Number(match[1]);
    }
    return {
      type,
      title,
      message,
      link: chatUserId ? "/admin/messages" : "/admin/messages",
      entityId: chatUserId ? `user-${chatUserId}` : null,
      chatUserId,
    };
  }

  if (bookingId != null) {
    return {
      type,
      title,
      message,
      link: "/admin/bookings",
      entityId: `BK-${bookingId}`,
    };
  }

  return {
    type,
    title,
    message,
    link: type === "booking" ? "/admin/bookings" : "/admin",
    entityId: null,
  };
}

/** User-facing notification from realtime payload. */
export function toUserNotificationView(payload) {
  const type = (payload.type ?? payload.Type ?? "system").toLowerCase();
  const bookingId = payload.bookingId ?? payload.BookingId ?? null;
  const message = payload.message ?? payload.Message ?? "";

  let link = null;
  if (type === "booking" && bookingId != null) {
    link = `/bookings/${bookingId}`;
  } else if (type === "support") {
    link = "/contact";
  }

  return {
    type,
    title: payload.title ?? payload.Title ?? "Notification",
    message,
    link,
    bookingId,
    bookingServerId: bookingId,
  };
}
