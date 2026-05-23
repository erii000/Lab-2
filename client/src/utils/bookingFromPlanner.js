import { BOOKING_STATUS, calculateBookingProgress } from "./bookingConstants.js";
import { generateTripOffers } from "./destinationSearch.js";
import {
  computePlannerPricing,
  flattenPlannerActivities,
  plannerDaysToBookingItinerary,
} from "./itineraryPricing.js";

function newId() {
  return `bk_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Materialize a booking draft from the live planner trip (source of truth for activities + total).
 */
export function createBookingFromPlanner(trip, existingBooking = null) {
  const destination = trip.destination;
  const params = trip.params;
  const { quote, summary } = computePlannerPricing(trip);
  const offers = trip.offers ?? generateTripOffers(destination, {
    start: params.start,
    end: params.end,
    guests: params.travelers,
    hotelTierId: params.vibe === "luxury" ? "luxury" : "boutique",
  });

  const flight = offers.flights[0] ?? null;
  const hotel = offers.hotels.find((h) => h.recommended) ?? offers.hotels[0] ?? null;
  const plannerExperiences = flattenPlannerActivities(trip.days, params.travelers);

  const startDate = new Date(params.start);
  const endDate = new Date(params.end);

  const booking = {
    id: existingBooking?.id ?? newId(),
    createdAt: existingBooking?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: existingBooking?.status ?? BOOKING_STATUS.DRAFT,
    source: "itinerary-planner",
    destinationId: destination.id,
    destinationTitle: destination.title,
    destinationImage: destination.image,
    packageTitle: trip.meta?.title ?? `${destination.title} Journey`,
    start: params.start,
    end: params.end,
    startLabel: startDate.toLocaleDateString("en-GB", { month: "short", day: "numeric" }),
    endLabel: endDate.toLocaleDateString("en-GB", { month: "short", day: "numeric" }),
    guests: params.travelers,
    vibe: params.vibe,
    total: quote.total,
    subtotal: quote.subtotal,
    lineItems: quote.lineItems,
    summary,
    selections: {
      flightId: flight?.id,
      hotelId: hotel?.id,
      experienceIds: trip.catalogActivityIds ?? [],
    },
    flight: flight ? { ...flight } : null,
    hotel: hotel ? { ...hotel } : null,
    experiences: plannerExperiences,
    plannerDays: trip.days,
    traveler: existingBooking?.traveler ?? {
      fullName: "",
      passport: "",
      nationality: "",
      email: "",
      phone: "",
    },
    itinerary: plannerDaysToBookingItinerary(trip.days),
    bookingReference: existingBooking?.bookingReference ?? null,
  };

  booking.progress = calculateBookingProgress(booking);
  return booking;
}
