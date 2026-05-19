import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BOOKING_STATUS, calculateBookingProgress, isDraftStatus } from "../utils/bookingConstants.js";
import { createBookingFromConfigurator } from "../utils/bookingFactory.js";

const defaultUser = {
  id: "user_demo",
  name: "Travel Guest",
  email: "guest@smarttravel.app",
};

export const useBookingStore = create(
  persist(
    (set, get) => ({
      authUser: defaultUser,
      selectedTrip: null,
      currentBookingId: null,
      bookingDrafts: [],
      savedDestinations: [],

      setSelectedTrip: (trip) => set({ selectedTrip: trip }),

      setCurrentBooking: (bookingId) => set({ currentBookingId: bookingId }),

      getBookingById: (id) => get().bookingDrafts.find((b) => b.id === id),

      getDraftCount: () =>
        get().bookingDrafts.filter((b) => isDraftStatus(b.status)).length,

      deleteBooking: (bookingId) =>
        set((state) => {
          const bookingDrafts = state.bookingDrafts.filter((b) => b.id !== bookingId);
          const currentBookingId =
            state.currentBookingId === bookingId ? null : state.currentBookingId;
          return { bookingDrafts, currentBookingId };
        }),

      upsertBooking: (booking) =>
        set((state) => {
          const idx = state.bookingDrafts.findIndex((b) => b.id === booking.id);
          const next = { ...booking, updatedAt: new Date().toISOString(), progress: calculateBookingProgress(booking) };
          if (idx >= 0) {
            const bookingDrafts = [...state.bookingDrafts];
            bookingDrafts[idx] = next;
            return { bookingDrafts, currentBookingId: next.id };
          }
          return {
            bookingDrafts: [next, ...state.bookingDrafts],
            currentBookingId: next.id,
          };
        }),

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
          booking.progress = calculateBookingProgress(booking);
        }
        get().upsertBooking(booking);
        return booking;
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
                  progress: calculateBookingProgress({ ...b, status: BOOKING_STATUS.PENDING_PAYMENT }),
                  updatedAt: new Date().toISOString(),
                }
              : b,
          ),
        })),

      confirmPayment: (bookingId) => {
        const ref = `STA-${bookingId.slice(-6).toUpperCase()}`;
        set((state) => ({
          bookingDrafts: state.bookingDrafts.map((b) =>
            b.id === bookingId
              ? {
                  ...b,
                  status: BOOKING_STATUS.CONFIRMED,
                  bookingReference: ref,
                  progress: 100,
                  updatedAt: new Date().toISOString(),
                }
              : b,
          ),
        }));
        return ref;
      },

      toggleSavedDestination: (destinationId) =>
        set((state) => {
          const exists = state.savedDestinations.includes(destinationId);
          return {
            savedDestinations: exists
              ? state.savedDestinations.filter((id) => id !== destinationId)
              : [...state.savedDestinations, destinationId],
          };
        }),

      markCompleted: (bookingId) =>
        set((state) => ({
          bookingDrafts: state.bookingDrafts.map((b) =>
            b.id === bookingId ? { ...b, status: BOOKING_STATUS.COMPLETED, progress: 100 } : b,
          ),
        })),
    }),
    {
      name: "sta-bookings-v1",
      partialize: (state) => ({
        authUser: state.authUser,
        bookingDrafts: state.bookingDrafts,
        savedDestinations: state.savedDestinations,
        currentBookingId: state.currentBookingId,
      }),
    },
  ),
);
