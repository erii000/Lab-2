import { getCatalogDestinations, getDestinationById } from "../data/destinations.js";

const MS_PER_DAY = 86_400_000;

export function normalizeQuery(value) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "");
}

export function formatISODate(date) {
  return date.toISOString().slice(0, 10);
}

export function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function todayISO() {
  return formatISODate(new Date());
}

export function defaultTripDates() {
  const start = addDays(new Date(), 14);
  const end = addDays(start, 4);
  return { start: formatISODate(start), end: formatISODate(end) };
}

export function diffNights(start, end) {
  if (!start || !end) return 3;
  const nights = Math.round((new Date(end) - new Date(start)) / MS_PER_DAY);
  return Math.max(1, nights);
}

export function resolveDestinationId(query) {
  const q = normalizeQuery(query);
  if (!q) return null;

  const destinations = getCatalogDestinations();
  const exact = destinations.find(
    (d) =>
      normalizeQuery(d.title) === q ||
      normalizeQuery(d.id) === q ||
      d.aliases?.some((a) => normalizeQuery(a) === q),
  );
  if (exact) return exact.id;

  const partial = destinations.find(
    (d) =>
      normalizeQuery(d.title).includes(q) ||
      q.includes(normalizeQuery(d.title)) ||
      d.aliases?.some((a) => a.includes(q) || q.includes(a)),
  );
  return partial?.id ?? null;
}

export function searchDestinations({ query = "", budget, tripType, maxResults = 20 } = {}) {
  const q = normalizeQuery(query);
  const destinations = getCatalogDestinations() ?? [];

  let results = destinations.filter((d) => {
    if (budget && d.priceFrom > Number(budget)) return false;
    if (tripType && !d.tripTypes?.includes(tripType)) return false;
    if (!q) return true;
    return (
      normalizeQuery(d.title).includes(q) ||
      normalizeQuery(d.country).includes(q) ||
      normalizeQuery(d.region).includes(q) ||
      d.aliases?.some((a) => a.includes(q) || q.includes(a))
    );
  });

  if (q) {
    results = [...results].sort((a, b) => {
      const score = (d) => {
        const title = normalizeQuery(d.title);
        if (title === q) return 0;
        if (title.startsWith(q)) return 1;
        return 2;
      };
      return score(a) - score(b);
    });
  }

  return results.slice(0, maxResults);
}

export function getDestinationDetail(id) {
  const base = getDestinationById(id);
  if (!base) return null;
  return base;
}

export function buildDestinationUrl(id, params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return `/destination/${id}${qs ? `?${qs}` : ""}`;
}

export function buildBookingUrl(id, params = {}) {
  const { bookingId, guests, ...rest } = params;
  const search = new URLSearchParams({ destination: id, ...rest });
  if (guests) search.set("guests", String(guests));
  if (bookingId) search.set("bookingId", bookingId);
  return `/booking?${search.toString()}`;
}

const DEPARTURE_BADGES = [
  { id: "best-value", label: "🔥 Best Value", tone: "warning" },
  { id: "almost-full", label: "⚡ Almost Full", tone: "error" },
  { id: "recommended", label: "🥇 Recommended", tone: "primary" },
  { id: "luxury", label: "💎 Luxury Deal", tone: "info" },
  { id: "family", label: "👨‍👩‍👧 Family Favorite", tone: "success" },
];

function pickBadge(index, slotsLeft, priceRank) {
  if (slotsLeft <= 4) return DEPARTURE_BADGES.find((b) => b.id === "almost-full");
  if (priceRank === 0) return DEPARTURE_BADGES.find((b) => b.id === "best-value");
  if (index % 5 === 2) return DEPARTURE_BADGES.find((b) => b.id === "recommended");
  if (index % 5 === 3) return DEPARTURE_BADGES.find((b) => b.id === "luxury");
  if (index % 5 === 4) return DEPARTURE_BADGES.find((b) => b.id === "family");
  return DEPARTURE_BADGES.find((b) => b.id === "recommended");
}

function weatherHint(dest, _monthIndex) {
  const warm = dest.weather?.tempC >= 22;
  if (warm) return `Perfect weather during these dates ☀️ · ~${dest.weather.tempC}°C`;
  return `${dest.weather?.condition ?? "Mild"} · ~${dest.weather?.tempC ?? 18}°C — pack layers`;
}

/** Weekly departure windows — prices & badges react to guests/budget */
export function getAvailabilityWindows(
  destinationId,
  { weeks = 10, guests = 2, budget } = {},
) {
  const dest = getDestinationById(destinationId);
  if (!dest) return [];

  const guestCount = Math.max(1, Number(guests) || 1);
  const budgetNum = budget ? Number(budget) : null;
  const windows = [];
  const base = addDays(new Date(), 7);

  const rawPrices = [];

  for (let i = 0; i < weeks; i += 1) {
    const start = addDays(base, i * 7);
    const end = addDays(start, 4);
    const seasonFactor = 1 + (i % 3) * 0.06;
    const demandFactor = i < 3 ? 1.12 : 1;
    const groupFactor = guestCount >= 4 ? 0.94 : guestCount === 1 ? 1.08 : 1;
    const pricePerPerson = Math.round(dest.priceFrom * seasonFactor * demandFactor * groupFactor);
    rawPrices.push(pricePerPerson);
    windows.push({ start, end, pricePerPerson, index: i });
  }

  const minPrice = Math.min(...rawPrices);

  return windows.map(({ start, end, pricePerPerson, index: i }) => {
    const nights = diffNights(formatISODate(start), formatISODate(end));
    const slotsLeft = Math.max(2, 12 - i * 2 - (guestCount > 3 ? 2 : 0));
    const badge = pickBadge(i, slotsLeft, pricePerPerson === minPrice ? 0 : 1);
    const tripTotal = calculateTripQuote(dest, {
      start: formatISODate(start),
      end: formatISODate(end),
      guests: guestCount,
      hotelTierId: "boutique",
      selectedActivityIds: [],
    });
    const suggestedBudget = Math.round(tripTotal.total * 1.05);
    const fitsBudget = budgetNum ? suggestedBudget <= budgetNum : true;
    const travelScore = Math.min(99, Math.round(72 + dest.rating * 5 - i * 1.5));

    return {
      id: `${destinationId}-${formatISODate(start)}`,
      start: formatISODate(start),
      end: formatISODate(end),
      label: start.toLocaleDateString("en-GB", { month: "short", day: "numeric" }),
      pricePerPerson,
      slotsLeft,
      badge,
      suggestedGuests: guestCount,
      suggestedBudget,
      fitsBudget,
      nights,
      travelScore,
      weatherHint: weatherHint(dest, start.getMonth()),
      aiNote:
        i % 3 === 0
          ? `AI recommends ${dest.title} for culture & dining this week.`
          : `Strong value vs. peak season — book within 48h for best rates.`,
      routeLabel: `${dest.airportCode} direct`,
    };
  });
}

export function generateTripOffers(destination, { start, end, guests, hotelTierId }) {
  if (!destination) return { flights: [], hotels: [], packages: [] };
  const guestCount = Math.max(1, Number(guests) || 1);
  const quote = calculateTripQuote(destination, { start, end, guests: guestCount, hotelTierId });

  const flights = [0, 1, 2].map((i) => ({
    id: `f-${i}`,
    title: `${destination.airportCode} · ${i === 0 ? "Direct premium" : i === 1 ? "Best value" : "Flexible fare"}`,
    meta: `${7 + i}:${30 + i * 5} departure · ${i === 0 ? "Lounge access" : "1 checked bag"}`,
    price: Math.round(destination.flightEstimate * (1 + i * 0.12)) * guestCount,
    rating: 4.9 - i * 0.15,
  }));

  const hotels = (destination.hotelTiers ?? []).map((tier, i) => ({
    id: `h-${tier.id}`,
    title: tier.label,
    meta: `${quote.nights} nights · breakfast · free cancellation 24h`,
    price: tier.nightly * quote.nights,
    rating: 4.85 - i * 0.1,
  }));

  const packages = (destination.activities ?? []).slice(0, 4).map((act) => ({
    id: `p-${act.id}`,
    title: act.name,
    meta: `${act.duration} · ${act.category}`,
    price: act.price * guestCount,
    rating: act.rating,
  }));

  return { flights, hotels, packages, quote };
}

export function calculateTripQuote(
  destination,
  {
    start,
    end,
    guests = 2,
    budget,
    hotelTierId = "boutique",
    selectedActivityIds = [],
  } = {},
) {
  const nights = diffNights(start, end);
  const guestCount = Math.max(1, Number(guests) || 1);
  const tier =
    destination.hotelTiers?.find((h) => h.id === hotelTierId) ?? destination.hotelTiers?.[0];
  const nightly = tier?.nightly ?? Math.round(destination.priceFrom / 3);

  const hotel = nightly * nights;
  const flights = destination.flightEstimate * guestCount;
  const activities = (destination.activities ?? [])
    .filter((a) => selectedActivityIds.includes(a.id))
    .reduce((sum, a) => sum + a.price * guestCount, 0);
  const serviceFee = Math.round((hotel + flights + activities) * 0.08);
  const taxes = Math.round((hotel + flights) * 0.06);
  const subtotal = hotel + flights + activities;
  const total = subtotal + serviceFee + taxes;
  const perPerson = Math.round(total / guestCount);
  const budgetNum = budget ? Number(budget) : null;
  const withinBudget = budgetNum ? total <= budgetNum : null;

  return {
    nights,
    guests: guestCount,
    hotelTier: tier?.label ?? "Standard",
    lineItems: [
      { label: `Flights (${guestCount} traveler${guestCount > 1 ? "s" : ""})`, amount: flights },
      { label: `${tier?.label ?? "Hotel"} · ${nights} night${nights > 1 ? "s" : ""}`, amount: hotel },
      ...(activities > 0
        ? [{ label: `Experiences (${selectedActivityIds.length})`, amount: activities }]
        : []),
      { label: "Service fee", amount: serviceFee },
      { label: "Taxes & levies", amount: taxes },
    ],
    subtotal,
    total,
    perPerson,
    withinBudget,
    budgetRemaining: budgetNum ? budgetNum - total : null,
  };
}

export function parseTripSearchParams(searchParams) {
  const defaults = defaultTripDates();
  return {
    start: searchParams.get("start") || defaults.start,
    end: searchParams.get("end") || defaults.end,
    guests: Math.max(1, Number(searchParams.get("guests")) || 2),
    budget: searchParams.get("budget") || "",
    hotel: searchParams.get("hotel") || "boutique",
    activities: searchParams.get("activities")?.split(",").filter(Boolean) ?? [],
  };
}

export function tripParamsToSearchParams({ start, end, guests, budget, hotel, activities }) {
  const params = {};
  if (start) params.start = start;
  if (end) params.end = end;
  if (guests) params.guests = guests;
  if (budget) params.budget = budget;
  if (hotel) params.hotel = hotel;
  if (activities?.length) params.activities = activities.join(",");
  return params;
}
