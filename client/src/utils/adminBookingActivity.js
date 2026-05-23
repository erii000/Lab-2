export const CANCEL_REASONS = [
  "Customer request",
  "Payment issue",
  "Provider unavailable",
  "Duplicate booking",
  "Travel restriction",
  "Other",
];

export const REFUND_REASONS = [
  "Customer request",
  "Service unavailable",
  "Booking issue",
  "Compensation",
  "Other",
];

export function formatActivityTimestamp(date = new Date()) {
  const d = date instanceof Date ? date : new Date(date);
  const dateLabel = d.toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" });
  const timeLabel = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return { date: dateLabel, time: timeLabel, iso: d.toISOString() };
}

export function paymentCardLabel(method) {
  if (method === "card") return "Visa **** 4821";
  if (method === "paypal") return "PayPal";
  if (method === "apple") return "Apple Pay";
  return "Card";
}

export function defaultTimelineForBooking(booking) {
  const items = [
    { id: "created", date: "May 2, 2026", time: "09:14", label: "Booking created" },
  ];
  if (booking.status === "confirmed" || booking.status === "paid" || booking.status === "pending") {
    if (booking.status !== "pending") {
      items.push({ id: "paid", date: "May 2, 2026", time: "09:18", label: "Payment confirmed" });
    }
  }
  if (booking.status === "cancelled") {
    items.push({ id: "cancelled", date: "May 4, 2026", time: "10:11", label: "Booking cancelled by admin" });
  }
  if (booking.status === "refunded" || booking.status === "partially_refunded") {
    items.push({ id: "refunded", date: "May 8, 2026", time: "14:32", label: "Refund processed by admin" });
  }
  return items;
}

export function enrichBooking(booking) {
  return {
    ...booking,
    paymentCardDisplay: booking.paymentCardDisplay ?? paymentCardLabel(booking.paymentMethod),
    timeline: booking.timeline ?? defaultTimelineForBooking(booking),
    adminActions: booking.adminActions ?? [],
    refundedAmount: booking.refundedAmount ?? 0,
  };
}
