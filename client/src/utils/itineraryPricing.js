import { destinationById } from "../data/destinations.js";
import { calculateTripQuote, generateTripOffers } from "./destinationSearch.js";

/** Match planner row id back to catalog activity id when possible */
export function resolveCatalogActivityId(activityId, destination) {
  if (!activityId || !destination?.activities) return null;
  const exact = destination.activities.find((a) => a.id === activityId);
  if (exact) return exact.id;
  return destination.activities.find((a) => activityId.startsWith(`${a.id}-`))?.id ?? null;
}

export function sumPlannerActivityCosts(days) {
  return days.flatMap((d) => d.activities).reduce((sum, a) => sum + (Number(a.cost) || 0), 0);
}

export function extractCatalogActivityIds(days, destination) {
  const ids = new Set();
  days.forEach((day) => {
    day.activities.forEach((act) => {
      const catalogId = resolveCatalogActivityId(act.id, destination);
      if (catalogId) ids.add(catalogId);
    });
  });
  return [...ids];
}

export function flattenPlannerActivities(days, guests = 1) {
  return days.flatMap((day) =>
    day.activities.map((act) => ({
      id: act.id,
      name: act.title,
      duration: act.time ?? "—",
      price: guests > 0 ? Math.round((act.cost || 0) / guests) : act.cost || 0,
      priceTotal: act.cost || 0,
      category: "Experience",
      description: act.subtitle ?? "",
      rating: 4.8,
      day: day.day,
      dayLabel: day.label,
    })),
  );
}

export function plannerDaysToBookingItinerary(days) {
  return days.map((day) => ({
    day: day.day,
    title: day.label,
    items: day.activities.map((a) => `${a.time} · ${a.title}`),
  }));
}

/**
 * Full pricing from planner timeline — activities total drives the experiences line.
 */
export function computePlannerPricing(trip) {
  const destination = trip.destination ?? destinationById[trip.params?.destinationId];
  if (!destination) {
    return { summary: { activities: 0, hotel: 0, flights: 0, total: 0 }, quote: null };
  }

  const params = trip.params;
  const days = trip.days ?? [];
  const guests = params.travelers ?? 2;
  const hotelTierId = params.vibe === "luxury" ? "luxury" : "boutique";
  const catalogIds = extractCatalogActivityIds(days, destination);

  const baseQuote = calculateTripQuote(destination, {
    start: params.start,
    end: params.end,
    guests,
    budget: params.budget,
    hotelTierId,
    selectedActivityIds: catalogIds,
  });

  const activitiesTotal = sumPlannerActivityCosts(days);
  const flights =
    baseQuote.lineItems.find((l) => l.label.startsWith("Flights"))?.amount ??
    destination.flightEstimate * guests;
  const hotel =
    baseQuote.lineItems.find((l) => l.label.includes("Hotel") || l.label.includes("★"))?.amount ?? 0;

  const subtotal = flights + hotel + activitiesTotal;
  const serviceFee = Math.round(subtotal * 0.08);
  const taxes = Math.round((flights + hotel) * 0.06);
  const total = subtotal + serviceFee + taxes;

  const experienceCount = days.flatMap((d) => d.activities).length;

  const quote = {
    ...baseQuote,
    subtotal,
    total,
    lineItems: [
      { label: `Flights (${guests} traveler${guests > 1 ? "s" : ""})`, amount: flights },
      {
        label: `${baseQuote.hotelTier} · ${baseQuote.nights} night${baseQuote.nights > 1 ? "s" : ""}`,
        amount: hotel,
      },
      {
        label: `Experiences (${experienceCount} in itinerary)`,
        amount: activitiesTotal,
      },
      { label: "Service fee", amount: serviceFee },
      { label: "Taxes & levies", amount: taxes },
    ],
  };

  return {
    summary: {
      activities: activitiesTotal,
      hotel,
      flights,
      serviceFee,
      taxes,
      total,
    },
    quote,
    catalogActivityIds: catalogIds,
  };
}

export function applyTripPricing(trip) {
  const { summary, quote, catalogActivityIds } = computePlannerPricing(trip);
  const offers = generateTripOffers(trip.destination, {
    start: trip.params.start,
    end: trip.params.end,
    guests: trip.params.travelers,
    hotelTierId: trip.params.vibe === "luxury" ? "luxury" : "boutique",
  });

  return {
    ...trip,
    days: trip.days,
    summary,
    quote,
    catalogActivityIds,
    offers,
    updatedAt: new Date().toISOString(),
  };
}
