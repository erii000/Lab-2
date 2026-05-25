import { getDestinationById } from "../data/destinations.js";
import {
  defaultTripDates,
  diffNights,
  resolveDestinationId,
} from "./destinationSearch.js";
import { formatExploreDateRange } from "./exploreSearch.js";
import { applyTripPricing } from "./itineraryPricing.js";

const VIBE_LABELS = {
  romantic: "Romantic Escape",
  family: "Family Adventure",
  luxury: "Luxury Getaway",
  adventure: "Adventure Trail",
  culture: "Culture & Heritage",
  default: "Curated Journey",
};

const DEFAULT_TIMES = ["10:00", "14:00", "16:30", "19:30"];

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export function parsePlannerParams(searchParams) {
  const defaults = defaultTripDates();
  const destination =
    searchParams.get("destination") ||
    searchParams.get("q") ||
    "";
  const resolvedId = resolveDestinationId(destination) || searchParams.get("id") || "paris";

  return {
    destinationId: resolvedId,
    destinationQuery: destination,
    start: searchParams.get("start") || defaults.start,
    end: searchParams.get("end") || defaults.end,
    travelers: Math.max(1, Number(searchParams.get("travelers") || searchParams.get("guests")) || 2),
    budget: searchParams.get("budget") ? Number(searchParams.get("budget")) : null,
    vibe: searchParams.get("vibe") || searchParams.get("experience") || "romantic",
  };
}

export function buildItineraryPlannerUrl(destinationId, tripParams = {}) {
  const params = new URLSearchParams();
  params.set("destination", destinationId);
  if (tripParams.start) params.set("start", tripParams.start);
  if (tripParams.end) params.set("end", tripParams.end);
  if (tripParams.guests || tripParams.travelers) {
    params.set("travelers", String(tripParams.guests ?? tripParams.travelers));
  }
  if (tripParams.budget) params.set("budget", String(tripParams.budget));
  if (tripParams.vibe || tripParams.experience) {
    params.set("vibe", tripParams.vibe || tripParams.experience);
  }
  return `/itinerary?${params.toString()}`;
}

function activityFromCatalog(act, time, guests) {
  return {
    id: act?.id ? `${act.id}-${uid("a")}` : uid("act"),
    time,
    title: act?.name ?? "Local experience",
    subtitle: act?.description?.slice(0, 72) ?? "Curated for your dates",
    cost: Math.round((act?.price ?? 0) * guests),
  };
}

export function buildInitialTrip(params) {
  const dest = getDestinationById(params.destinationId) ?? getDestinationById("paris");
  const guests = params.travelers;
  const acts = dest.activities ?? [];
  const nights = diffNights(params.start, params.end);
  const dayCount = Math.min(Math.max(nights, 2), 5);

  const day1Acts = [
    {
      id: uid("transfer"),
      time: "14:00",
      title: "Airport transfer",
      subtitle: `Private pickup · ${dest.airportCode}`,
      cost: 35 * guests,
    },
    activityFromCatalog(acts[0], "16:30", 1),
    {
      id: uid("dinner"),
      time: "19:30",
      title: "Dinner reservation",
      subtitle: "Rooftop dining with skyline views",
      cost: 48 * guests,
    },
  ];

  const days = [
    {
      day: 1,
      label: "Arrival & orientation",
      activities: day1Acts,
    },
  ];

  const dayTitles = [
    "Signature experiences",
    "Culture & highlights",
    "Free exploration",
    "Coastal or day trip",
    "Departure day",
  ];

  for (let d = 2; d <= dayCount; d += 1) {
    const slice = acts.slice((d - 2) * 2, (d - 2) * 2 + 2);
    const activities =
      slice.length > 0
        ? slice.map((act, i) => activityFromCatalog(act, DEFAULT_TIMES[i] ?? "11:00", 1))
        : [
            {
              id: uid("free"),
              time: "11:00",
              title: "Neighborhood discovery",
              subtitle: `Self-guided walk in ${dest.title}`,
              cost: 0,
            },
          ];
    days.push({
      day: d,
      label: dayTitles[d - 2] ?? `Day ${d}`,
      activities,
    });
  }

  const trip = {
    destination: dest,
    meta: {
      title: `${dest.title} Journey`,
      location: `${dest.title}, ${dest.country}`,
      dateRange: formatExploreDateRange(params.start, params.end),
      travelers: guests,
      vibeLabel: VIBE_LABELS[params.vibe] ?? VIBE_LABELS.default,
      image: dest.image,
    },
    days,
    included: [
      "Airport transfer",
      "Daily breakfast",
      "City orientation tour",
      "24/7 trip support",
    ],
    params,
  };

  return applyTripPricing(trip);
}

export const aiAssistOptions = [
  { id: "restaurant", label: "Suggested restaurant nearby", detail: "Reserve a highly rated spot within walking distance of tonight's hotel." },
  { id: "route", label: "Optimize route", detail: "Reorder today's activities to minimize travel time between stops." },
  { id: "gems", label: "Add hidden gems", detail: "Insert a local favorite experience into a free afternoon slot." },
  { id: "afternoon", label: "Fill free afternoon", detail: "Add a light activity between 14:00–17:00 on your lightest day." },
  { id: "rain", label: "Rain-friendly activities", detail: "Swap outdoor plans for museums and covered markets." },
];

export function applyAiAssist(trip, optionId) {
  const dest = trip.destination;
  const extra = dest.activities?.[Math.floor(Math.random() * (dest.activities?.length || 1))];
  const guests = trip.params?.travelers ?? 2;
  const newAct = {
    id: extra?.id ? `${extra.id}-${uid("ai")}` : uid("ai"),
    time: "15:00",
    title: extra?.name ?? "AI-suggested experience",
    subtitle: aiAssistOptions.find((o) => o.id === optionId)?.detail ?? "Added by AI Assist",
    cost: Math.round((extra?.price ?? 25) * guests),
  };

  const days = trip.days.map((d, i) =>
    i === 1 ? { ...d, activities: [...d.activities, newAct] } : d,
  );

  return applyTripPricing({ ...trip, days });
}
