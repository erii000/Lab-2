import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  discardBookingOnApi,
  fetchMergedBookings,
  pushBookingToApi,
  pushLocalBookingsToApi,
} from "../services/bookingSync.js";
import {
  BOOKING_STATUS,
  calculateBookingProgress,
  isDraftStatus,
  shouldSyncBookingToApi,
} from "../utils/bookingConstants.js";
import { createBookingFromConfigurator } from "../utils/bookingFactory.js";
import { createBookingFromPlanner } from "../utils/bookingFromPlanner.js";
import { sessionToAuthUser } from "./sessionUser.js";

function readAccessToken() {
  try {
    const raw = localStorage.getItem("sta-auth-v2");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.session?.accessToken ?? null;
  } catch {
    return null;
  }
}

const pushInFlight = new Map();

async function persistBookingToApi(booking) {
  const token = readAccessToken();
  if (!token || !booking || !shouldSyncBookingToApi(booking)) return booking;

  const key = booking.id;
  if (pushInFlight.has(key)) {
    const serverId = await pushInFlight.get(key);
    return serverId ? { ...booking, serverId } : booking;
  }

  const task = pushBookingToApi(token, booking)
    .then((serverId) => serverId)
    .finally(() => {
      pushInFlight.delete(key);
    });
  pushInFlight.set(key, task);

  const serverId = await task;
  return { ...booking, serverId };
}

const defaultUser = sessionToAuthUser(null);

export const useBookingStore = create(
  persist(
    (set, get) => ({
      authUser: defaultUser,
      selectedTrip: null,
      currentBookingId: null,
      bookingDrafts: [],
      savedDestinations: [],
      /** Local ids and server ids the user removed (survives re-sync). */
      deletedBookingKeys: [],

      setAuthFromSession: (session) => set({ authUser: sessionToAuthUser(session) }),

      setSelectedTrip: (trip) => set({ selectedTrip: trip }),

      setCurrentBooking: (bookingId) => set({ currentBookingId: bookingId }),

      getBookingById: (id) =>
        get().bookingDrafts.find((b) => b.id === id || String(b.serverId) === String(id)),

      syncFromApi: async (accessToken) => {
        const token = accessToken ?? readAccessToken();
        if (!token) return;
        try {
          const hidden = get().deletedBookingKeys;
          const pushed = await pushLocalBookingsToApi(token, get().bookingDrafts, hidden);
          const merged = await fetchMergedBookings(token, pushed, hidden);
          set({ bookingDrafts: merged });
        } catch {
          /* offline */
        }
      },

      getDraftCount: () =>
        get().bookingDrafts.filter((b) => isDraftStatus(b.status)).length,

      deleteBooking: async (bookingId) => {
        const booking = get().getBookingById(bookingId);
        const token = readAccessToken();
        if (token && booking?.serverId) {
          try {
            await discardBookingOnApi(token, booking);
          } catch {
            /* tombstone still applied */
          }
        }

        const tombstone = new Set(get().deletedBookingKeys.map(String));
        tombstone.add(String(bookingId));
        if (booking?.serverId != null) tombstone.add(String(booking.serverId));

        set((state) => ({
          deletedBookingKeys: [...tombstone],
          bookingDrafts: state.bookingDrafts.filter(
            (b) => b.id !== bookingId && String(b.serverId) !== String(booking?.serverId),
          ),
          currentBookingId:
            state.currentBookingId === bookingId ? null : state.currentBookingId,
        }));
      },

      upsertBooking: (booking, options = {}) => {
        const idx = get().bookingDrafts.findIndex((b) => b.id === booking.id);
        let next = {
          ...booking,
          updatedAt: new Date().toISOString(),
          progress: calculateBookingProgress(booking),
        };
        if (idx >= 0) {
          const bookingDrafts = [...get().bookingDrafts];
          bookingDrafts[idx] = next;
          set({ bookingDrafts, currentBookingId: next.id });
        } else {
          set({
            bookingDrafts: [next, ...get().bookingDrafts],
            currentBookingId: next.id,
          });
        }
        if (options.skipSync) return next;
        persistBookingToApi(next).then((synced) => {
          if (!synced.serverId || synced.serverId === next.serverId) {
            if (synced !== next) get().upsertBooking(synced, { skipSync: true });
            return;
          }
          get().upsertBooking(synced, { skipSync: true });
        });
        return next;
      },

      saveDraftFromConfigurator: (payload, existingBookingId) => {
        const existing = existingBookingId ? get().getBookingById(existingBookingId) : null;
        const booking = createBookingFromConfigurator({
          ...payload,
          status: existing?.status ?? BOOKING_STATUS.DRAFT,
        });
        if (existing) {
          booking.id = existing.id;
          booking.createdAt = existing.createdAt;
          booking.traveler = existing.traveler;
          booking.bookingReference = existing.bookingReference;
          booking.serverId = existing.serverId;
          booking.progress = calculateBookingProgress(booking);
        }
        get().upsertBooking(booking);
        return booking;
      },

      continueBookingFromConfigurator: (payload, existingBookingId) => {
        const existing = existingBookingId ? get().getBookingById(existingBookingId) : null;
        const booking = createBookingFromConfigurator({
          ...payload,
          status: existing?.status ?? BOOKING_STATUS.DRAFT,
        });
        if (existing) {
          booking.id = existing.id;
          booking.createdAt = existing.createdAt;
          booking.traveler = existing.traveler;
          booking.bookingReference = existing.bookingReference;
          booking.serverId = existing.serverId;
          booking.progress = calculateBookingProgress(booking);
        }
        get().upsertBooking(booking);
        return booking;
      },

      continueBookingFromPlanner: (trip, existingBookingId) => {
        const existing = existingBookingId ? get().getBookingById(existingBookingId) : null;
        const booking = createBookingFromPlanner(trip, existing);
        get().upsertBooking(booking);
        return booking;
      },

      getCurrentBooking: () => {
        const id = get().currentBookingId;
        return id ? get().getBookingById(id) : null;
      },

      updateTraveler: (bookingId, travelerPatch) =>
        set((state) => {
          const bookingDrafts = state.bookingDrafts.map((b) => {
            if (b.id !== bookingId) return b;
            const traveler = { ...b.traveler, ...travelerPatch };
            const updated = {
              ...b,
              traveler,
              updatedAt: new Date().toISOString(),
            };
            const hasCore =
              traveler.fullName?.trim() &&
              traveler.passport?.trim() &&
              traveler.email?.trim();
            if (hasCore && b.status === BOOKING_STATUS.DRAFT) {
              updated.status = BOOKING_STATUS.TRAVELER_INFO_COMPLETED;
            }
            updated.progress = calculateBookingProgress(updated);
            return updated;
          });
          return { bookingDrafts };
        }),

      setPendingPayment: (bookingId) =>
        set((state) => ({
          bookingDrafts: state.bookingDrafts.map((b) =>
            b.id === bookingId
              ? {
                  ...b,
                  status: BOOKING_STATUS.PENDING_PAYMENT,
                  progress: calculateBookingProgress({
                    ...b,
                    status: BOOKING_STATUS.PENDING_PAYMENT,
                  }),
                  updatedAt: new Date().toISOString(),
                }
              : b,
          ),
        })),

      confirmPayment: (bookingId, paymentMeta = {}) => {
        const booking = get().getBookingById(bookingId);
        const ref = booking?.bookingReference ?? `STA-${String(bookingId).slice(-6).toUpperCase()}`;
        if (booking) {
          get().upsertBooking({
            ...booking,
            status: BOOKING_STATUS.CONFIRMED,
            serverId: paymentMeta.serverId ?? booking.serverId,
            bookingReference: ref,
            paymentMethod: paymentMeta.paymentMethod ?? booking.paymentMethod,
            paymentCardDisplay: paymentMeta.paymentCardDisplay ?? booking.paymentCardDisplay,
            paymentTransactionId: paymentMeta.transactionId ?? booking.paymentTransactionId,
          });
        }
        const token = readAccessToken();
        if (token) {
          void import("./adminBookingsStore.js").then(({ useAdminBookingsStore }) => {
            useAdminBookingsStore.getState().hydrateFromApi(token);
          });
        }
        return ref;
      },

      toggleSavedDestination: async (destinationId) => {
        const normalized = String(destinationId).toLowerCase();
        const exists = get().savedDestinations.includes(normalized);
        const next = exists
          ? get().savedDestinations.filter((id) => id !== normalized)
          : [...get().savedDestinations, normalized];
        set({ savedDestinations: next });
        const token = readAccessToken();
        if (!token) return;
        try {
          const { syncSavedDestinationToggle } = await import("../services/wishlistSync.js");
          await syncSavedDestinationToggle(token, normalized, !exists);
        } catch {
          /* local state kept */
        }
      },

      markCompleted: (bookingId) =>
        set((state) => ({
          bookingDrafts: state.bookingDrafts.map((b) =>
            b.id === bookingId ? { ...b, status: BOOKING_STATUS.COMPLETED, progress: 100 } : b,
          ),
        })),
    }),
    {
      name: "sta-bookings-v1",
      version: 2,
      partialize: (state) => ({
        authUser: state.authUser,
        bookingDrafts: state.bookingDrafts,
        savedDestinations: state.savedDestinations,
        currentBookingId: state.currentBookingId,
        deletedBookingKeys: state.deletedBookingKeys,
      }),
      migrate: (persisted, version) => {
        if (!persisted || typeof persisted !== "object") return persisted;
        if (version < 2) {
          return { ...persisted, deletedBookingKeys: [] };
        }
        return persisted;
      },
    },
  ),
);
