import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as bookingsApi from "../api/bookingsApi.js";
import { fetchAdminBookings } from "../services/adminDataSync.js";
import { adminStatusToApi } from "../utils/bookingMappers.js";
import { enrichBooking, formatActivityTimestamp } from "../utils/adminBookingActivity.js";
import { adminNotify } from "../utils/adminNotify.js";

function readAccessToken() {
  try {
    const raw = localStorage.getItem("sta-auth-v2");
    const parsed = JSON.parse(raw ?? "{}");
    return parsed?.state?.session?.accessToken ?? null;
  } catch {
    return null;
  }
}

async function patchServerStatus(booking, statusKey) {
  const token = readAccessToken();
  if (!token || !booking?.serverId) return;
  try {
    await bookingsApi.patchBookingStatus(token, booking.serverId, adminStatusToApi(statusKey));
  } catch {
    /* keep local state */
  }
}

const RECENT_IDS = ["BK-92841", "BK-92838", "BK-92835", "BK-92831", "BK-92828"];

export function selectRecentBookings(bookings) {
  const visible = filterAdminVisibleBookings(bookings);
  const ordered = RECENT_IDS.map((id) => visible.find((b) => b.id === id)).filter(Boolean);
  const base = ordered.length >= 3 ? ordered : visible;
  return base.slice(0, 5);
}

export const BOOKING_STATUS_OPTIONS = [
  { value: "paid", label: "Paid", storeValue: "confirmed" },
  { value: "pending", label: "Pending", storeValue: "pending" },
  { value: "cancelled", label: "Cancelled", storeValue: "cancelled" },
  { value: "refunded", label: "Refunded", storeValue: "refunded" },
  { value: "partially_refunded", label: "Partially refunded", storeValue: "partially_refunded" },
];

export function normalizeStatusKey(status) {
  if (status === "confirmed") return "paid";
  return status;
}

/** Unpaid drafts belong on the user app only, not admin. */
export function isAdminVisibleBooking(booking) {
  return normalizeStatusKey(booking?.status) !== "pending";
}

export function filterAdminVisibleBookings(bookings) {
  return bookings.filter(isAdminVisibleBooking);
}

export function statusToStoreValue(key) {
  const opt = BOOKING_STATUS_OPTIONS.find((o) => o.value === key);
  return opt?.storeValue ?? key;
}

function patchBooking(booking, patch) {
  return enrichBooking({ ...booking, ...patch });
}

function appendActivity(booking, label) {
  const ts = formatActivityTimestamp();
  return {
    timeline: [
      ...booking.timeline,
      { id: `evt-${Date.now()}`, date: ts.date, time: ts.time, label },
    ],
  };
}

function appendAdminAction(booking, title, detail) {
  const ts = formatActivityTimestamp();
  return {
    adminActions: [
      {
        id: `act-${Date.now()}`,
        title,
        detail,
        date: ts.date,
        time: ts.time,
      },
      ...booking.adminActions,
    ],
  };
}

export const useAdminBookingsStore = create(
  persist(
    (set, get) => ({
  bookings: [],
  loadedFromApi: false,
  hiddenBookingIds: [],

  hydrateFromApi: async (accessToken) => {
    const token = accessToken ?? readAccessToken();
    if (!token) return;
    try {
      const bookings = await fetchAdminBookings(token, get().hiddenBookingIds);
      set({ bookings: filterAdminVisibleBookings(bookings), loadedFromApi: true });
    } catch {
      set({ bookings: [], loadedFromApi: true });
    }
  },

  updateBookingStatus: (bookingId, statusKey) => {
    const booking = get().bookings.find((b) => b.id === bookingId);
    const storeStatus = statusToStoreValue(statusKey);
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === bookingId ? patchBooking(b, { status: storeStatus }) : b,
      ),
    }));
    const opt = BOOKING_STATUS_OPTIONS.find((o) => o.value === statusKey);
    if (booking) {
      patchServerStatus(booking, statusKey);
      adminNotify({
        type: "booking",
        title: "Booking status updated",
        message: `${booking.user} · ${booking.destination} → ${opt?.label ?? statusKey}`,
        link: "/admin/bookings",
        entityId: bookingId,
      });
    }
    return get().bookings.find((b) => b.id === bookingId);
  },

  approveBooking: (bookingId) => {
    const booking = get().bookings.find((b) => b.id === bookingId);
    if (!booking) return null;
    const next = patchBooking(booking, {
      status: "confirmed",
      ...appendActivity(booking, "Payment confirmed by admin"),
      ...appendAdminAction(booking, "Booking approved", "Payment marked as confirmed"),
    });
    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === bookingId ? next : b)),
    }));
    patchServerStatus(next, "confirmed");
    adminNotify({
      type: "booking",
      title: "Booking approved",
      message: `${booking.user} · ${booking.destination} — payment confirmed`,
      link: "/admin/bookings",
      entityId: bookingId,
    });
    return next;
  },

  cancelBooking: (bookingId, payload) => {
    const booking = get().bookings.find((b) => b.id === bookingId);
    if (!booking) return null;

    let next = patchBooking(booking, { status: "cancelled" });
    next = patchBooking(next, {
      ...appendActivity(next, "Booking cancelled by admin"),
      ...appendAdminAction(
        next,
        "Cancellation approved",
        payload.reason + (payload.notes ? ` — ${payload.notes}` : ""),
      ),
    });

    if (payload.issueRefund && payload.refundAmount > 0) {
      next = patchBooking(next, {
        refundedAmount: (next.refundedAmount ?? 0) + payload.refundAmount,
        ...appendActivity(next, `Refund of €${payload.refundAmount.toLocaleString()} issued`),
        ...appendAdminAction(next, "Refund processed by Admin", `€${payload.refundAmount.toLocaleString()} on cancellation`),
      });
      if (payload.refundAmount >= next.amount) {
        next = patchBooking(next, { status: "refunded" });
      }
    }

    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === bookingId ? next : b)),
    }));
    patchServerStatus(next, "cancelled");
    adminNotify({
      type: "booking",
      title: "Booking cancelled",
      message: `${booking.user} · ${booking.destination}${payload.issueRefund ? " — refund issued" : ""}`,
      link: "/admin/bookings",
      entityId: bookingId,
    });
    return next;
  },

  refundBooking: (bookingId, payload) => {
    const booking = get().bookings.find((b) => b.id === bookingId);
    if (!booking) return null;

    const isFull = payload.refundType === "full" || payload.refundAmount >= booking.amount;
    const status = isFull ? "refunded" : "partially_refunded";

    let next = patchBooking(booking, {
      status,
      refundedAmount: (booking.refundedAmount ?? 0) + payload.refundAmount,
    });
    next = patchBooking(next, {
      ...appendActivity(
        next,
        isFull
          ? "Full refund processed by admin"
          : `Partial refund of €${payload.refundAmount.toLocaleString()} processed`,
      ),
      ...appendAdminAction(
        next,
        isFull ? "Refund processed by Admin" : "Partial refund processed by Admin",
        `${payload.reason}${payload.note ? ` — ${payload.note}` : ""} · €${payload.refundAmount.toLocaleString()}`,
      ),
    });

    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === bookingId ? next : b)),
    }));
    patchServerStatus(next, status);
    adminNotify({
      type: "booking",
      title: isFull ? "Full refund processed" : "Partial refund processed",
      message: `${booking.user} · €${payload.refundAmount.toLocaleString()} — ${booking.destination}`,
      link: "/admin/bookings",
      entityId: bookingId,
    });
    return next;
  },

  getBookingById: (id) => get().bookings.find((b) => b.id === id),

  removeBooking: async (bookingId) => {
    const booking = get().bookings.find((b) => b.id === bookingId);
    if (booking?.serverId) {
      await patchServerStatus(booking, "cancelled");
    }
    const hidden = new Set(get().hiddenBookingIds.map(String));
    hidden.add(String(bookingId));
    if (booking?.serverId != null) hidden.add(String(booking.serverId));
    set((state) => ({
      hiddenBookingIds: [...hidden],
      bookings: state.bookings.filter((b) => b.id !== bookingId),
    }));
    if (booking) {
      adminNotify({
        type: "booking",
        title: "Booking removed",
        message: `${booking.id} · ${booking.user} — ${booking.destination}`,
        link: "/admin/bookings",
        entityId: bookingId,
      });
    }
  },
    }),
    {
      name: "sta-admin-bookings-v1",
      version: 2,
      partialize: (s) => ({ bookings: s.bookings, hiddenBookingIds: s.hiddenBookingIds }),
      migrate: (persisted, version) => {
        if (!persisted || typeof persisted !== "object") return persisted;
        if (version < 2) {
          return { ...persisted, bookings: [], loadedFromApi: false };
        }
        return persisted;
      },
    },
  ),
);
