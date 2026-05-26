import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ensurePlannerItinerary, hydratePlannerFromApi } from "../services/itinerarySync.js";
import { applyAiAssist, buildInitialTrip, parsePlannerParams } from "../utils/itineraryPlanner.js";
import { applyTripPricing } from "../utils/itineraryPricing.js";
import { useBookingStore } from "./bookingStore.js";

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

let timelineSaveTimer = null;

export const usePlannerStore = create(
  persist(
    (set, get) => ({
      trip: null,
      linkedBookingId: null,
      itinerarySyncing: false,

      initFromSearchParams: (searchParams) => {
        const params = parsePlannerParams(searchParams);
        const trip = applyTripPricing(buildInitialTrip(params));
        set({ trip });
        get().syncBookingDraft();
        return trip;
      },

      /** Create/load itinerary on server and persist timeline (when logged in). */
      syncItineraryToApi: async () => {
        const token = readAccessToken();
        const trip = get().trip;
        if (!token || !trip) return trip;

        set({ itinerarySyncing: true });
        try {
          let next = await ensurePlannerItinerary(token, trip);
          next = await hydratePlannerFromApi(token, next);
          const priced = applyTripPricing(next);
          set({ trip: priced });
          get().syncBookingDraft();
          return priced;
        } catch {
          return trip;
        } finally {
          set({ itinerarySyncing: false });
        }
      },

      scheduleTimelineSave: () => {
        if (timelineSaveTimer) clearTimeout(timelineSaveTimer);
        timelineSaveTimer = setTimeout(() => {
          get().syncTimelineToApi();
        }, 700);
      },

      syncTimelineToApi: async () => {
        const token = readAccessToken();
        const trip = get().trip;
        if (!token || !trip?.itineraryId || !trip.days?.length) return;

        try {
          const { saveItineraryTimeline } = await import("../api/itinerariesApi.js");
          await saveItineraryTimeline(token, trip.itineraryId, { days: trip.days });
        } catch {
          /* offline */
        }
      },

      setTrip: (trip) => {
        const priced = applyTripPricing(trip);
        set({ trip: priced });
        get().syncBookingDraft();
        get().scheduleTimelineSave();
        return priced;
      },

      setDays: (daysOrUpdater) => {
        const current = get().trip;
        if (!current) return null;
        const days =
          typeof daysOrUpdater === "function" ? daysOrUpdater(current.days) : daysOrUpdater;
        const result = get().setTrip({ ...current, days });
        return result;
      },

      applyAiSuggestion: (optionId) => {
        const current = get().trip;
        if (!current) return null;
        return get().setTrip(applyAiAssist(current, optionId));
      },

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

      continueToBooking: async () => {
        await get().syncItineraryToApi();
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
      version: 2,
      partialize: (state) => ({
        trip: state.trip,
        linkedBookingId: state.linkedBookingId,
      }),
    },
  ),
);
