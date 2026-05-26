import * as itinerariesApi from "../api/itinerariesApi.js";

function parseTimelineJson(timelineJson) {
  if (!timelineJson) return null;
  try {
    const parsed = typeof timelineJson === "string" ? JSON.parse(timelineJson) : timelineJson;
    return Array.isArray(parsed) ? parsed : parsed?.days ?? null;
  } catch {
    return null;
  }
}

/** @param {object} trip */
export function tripToGeneratePayload(trip) {
  const dest = trip.destination;
  return {
    destination: dest?.title ?? trip.params?.destinationQuery ?? "Paris",
    country: dest?.country ?? null,
    startDate: trip.params.start,
    endDate: trip.params.end,
    tripTitle: trip.meta?.title ?? `${dest?.title ?? "Trip"} Journey`,
    budgetLevel: trip.params.budget ? "custom" : null,
  };
}

/**
 * Ensure the planner trip has a server itinerary id and persisted timeline.
 * @param {string} accessToken
 * @param {object} trip
 */
export async function ensurePlannerItinerary(accessToken, trip) {
  if (!accessToken || !trip) return trip;

  let itineraryId = trip.itineraryId ?? null;

  if (!itineraryId) {
    const created = await itinerariesApi.generateItinerary(accessToken, tripToGeneratePayload(trip));
    itineraryId = created.id ?? created.Id;
  }

  if (trip.days?.length) {
    await itinerariesApi.saveItineraryTimeline(accessToken, itineraryId, { days: trip.days });
  }

  return { ...trip, itineraryId };
}

/**
 * Load saved timeline from API when itinerary id exists.
 * @param {string} accessToken
 * @param {object} trip
 */
export async function hydratePlannerFromApi(accessToken, trip) {
  if (!accessToken || !trip?.itineraryId) return trip;

  try {
    const detail = await itinerariesApi.getItinerary(accessToken, trip.itineraryId);
    const days = parseTimelineJson(detail.timelineJson ?? detail.TimelineJson);
    if (days?.length) {
      return { ...trip, days };
    }
  } catch {
    /* use local timeline */
  }
  return trip;
}
