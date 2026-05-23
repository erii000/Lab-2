import { create } from "zustand";
import { persist } from "zustand/middleware";
import { applyAiAssist, buildInitialTrip, parsePlannerParams } from "../utils/itineraryPlanner.js";
import { applyTripPricing } from "../utils/itineraryPricing.js";
import { useBookingStore } from "./bookingStore.js";

export const usePlannerStore = create(
  persist(
    (set, get) => ({
      trip: null,
      linkedBookingId: null,

      initFromSearchParams: (searchParams) => {
        const params = parsePlannerParams(searchParams);
        const trip = applyTripPricing(buildInitialTrip(params));
        set({ trip });
        get().syncBookingDraft();
        return trip;
      },

      setTrip: (trip) => {
        const priced = applyTripPricing(trip);
        set({ trip: priced });
        get().syncBookingDraft();
        return priced;
      },

      setDays: (daysOrUpdater) => {
        const current = get().trip;
        if (!current) return null;
        const days =
          typeof daysOrUpdater === "function" ? daysOrUpdater(current.days) : daysOrUpdater;
        return get().setTrip({ ...current, days });
      },

      applyAiSuggestion: (optionId) => {
        const current = get().trip;
        if (!current) return null;
        return get().setTrip(applyAiAssist(current, optionId));
      },

      /** Keep booking draft in sync whenever the itinerary or pricing changes */
      syncBookingDraft: () => {
        const trip = get().trip;
        if (!trip) return null;
        const bookingStore = useBookingStore.getState();
        const existing = get().linkedBookingId
          ? bookingStore.getBookingById(get().linkedBookingId)
          : null;
        const booking = bookingStore.continueBookingFromPlanner(trip, existing?.id);
        set({ linkedBookingId: booking.id });
        return booking;
      },

      continueToBooking: () => {
        const booking = get().syncBookingDraft();
        if (booking) {
          useBookingStore.getState().setCurrentBooking(booking.id);
        }
        return booking;
      },

      clear: () => set({ trip: null, linkedBookingId: null }),
    }),
    {
      name: "sta-planner-v1",
      partialize: (state) => ({
        trip: state.trip,
        linkedBookingId: state.linkedBookingId,
      }),
    },
  ),
);
