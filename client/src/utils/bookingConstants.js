export const BOOKING_STATUS = {
  DRAFT: "draft",
  TRAVELER_INFO_COMPLETED: "traveler_info_completed",
  PENDING_PAYMENT: "pending_payment",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
};

export const STATUS_LABELS = {
  [BOOKING_STATUS.DRAFT]: "Draft",
  [BOOKING_STATUS.TRAVELER_INFO_COMPLETED]: "Details added",
  [BOOKING_STATUS.PENDING_PAYMENT]: "Pending payment",
  [BOOKING_STATUS.CONFIRMED]: "Confirmed",
  [BOOKING_STATUS.CANCELLED]: "Cancelled",
  [BOOKING_STATUS.COMPLETED]: "Completed",
};

export const STATUS_COLORS = {
  [BOOKING_STATUS.DRAFT]: "default",
  [BOOKING_STATUS.TRAVELER_INFO_COMPLETED]: "info",
  [BOOKING_STATUS.PENDING_PAYMENT]: "warning",
  [BOOKING_STATUS.CONFIRMED]: "success",
  [BOOKING_STATUS.CANCELLED]: "error",
  [BOOKING_STATUS.COMPLETED]: "secondary",
};

export function calculateBookingProgress(booking) {
  if (!booking) return 0;
  if (booking.status === BOOKING_STATUS.CONFIRMED) return 100;
  if (booking.status === BOOKING_STATUS.COMPLETED) return 100;
  if (booking.status === BOOKING_STATUS.PENDING_PAYMENT) return 85;

  const t = booking.traveler ?? {};
  let score = 35;
  if (booking.flight && booking.hotel) score += 15;
  if (t.fullName?.trim()) score += 15;
  if (t.passport?.trim()) score += 10;
  if (t.nationality?.trim()) score += 8;
  if (t.email?.trim() && t.phone?.trim()) score += 12;

  if (booking.status === BOOKING_STATUS.TRAVELER_INFO_COMPLETED) {
    return Math.max(score, 60);
  }
  return Math.min(score, 55);
}

export function isDraftStatus(status) {
  return (
    status === BOOKING_STATUS.DRAFT ||
    status === BOOKING_STATUS.TRAVELER_INFO_COMPLETED ||
    status === BOOKING_STATUS.PENDING_PAYMENT
  );
}

/** Paid / finalized on server — safe to show in admin and sync to API. */
export function isPaidBookingStatus(status) {
  return status === BOOKING_STATUS.CONFIRMED || status === BOOKING_STATUS.COMPLETED;
}

/** Only confirmed/completed bookings are persisted server-side (drafts stay local). */
export function shouldSyncBookingToApi(booking) {
  return Boolean(booking && isPaidBookingStatus(booking.status));
}

export function isUpcomingBooking(booking) {
  if (booking.status !== BOOKING_STATUS.CONFIRMED) return false;
  const end = new Date(booking.end);
  return end >= new Date();
}

export function isCompletedBooking(booking) {
  if (booking.status === BOOKING_STATUS.COMPLETED) return true;
  if (booking.status !== BOOKING_STATUS.CONFIRMED) return false;
  return new Date(booking.end) < new Date();
}
