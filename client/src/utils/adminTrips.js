export const TRIP_STATUSES = [
  { value: "draft", label: "Draft", color: "default" },
  { value: "pending_review", label: "Pending review", color: "warning" },
  { value: "published", label: "Published", color: "info" },
  { value: "active", label: "Active", color: "success" },
  { value: "fully_booked", label: "Fully booked", color: "error" },
  { value: "archived", label: "Archived", color: "default" },
  { value: "cancelled", label: "Cancelled", color: "error" },
];

export const TRIP_STYLE_OPTIONS = ["romantic", "luxury", "adventure", "family", "city break", "beach"];

export function getTripStatusMeta(status) {
  return TRIP_STATUSES.find((s) => s.value === status) ?? TRIP_STATUSES[0];
}

export function createEmptyTrip() {
  const id = `trip-${Date.now().toString(36)}`;
  return enrichTrip({
    id,
    title: "",
    subtitle: "",
    destination: "",
    country: "",
    days: 4,
    priceFrom: 0,
    bookings: 0,
    image: "",
    gallery: [],
    description: "",
    aiSummary: "",
    style: "luxury",
    status: "draft",
    deletedAt: null,
  });
}

export function enrichTrip(trip) {
  const capacity = trip.capacity ?? 24;
  const bookings = trip.bookings ?? 0;
  const occupancy = capacity ? Math.min(100, Math.round((bookings / capacity) * 100)) : 0;
  const priceFrom = trip.priceFrom ?? trip.pricing?.total ?? 720;

  return {
    ...trip,
    destination: trip.destination ?? trip.title?.split(" ")[0] ?? "",
    capacity,
    occupancy,
    revenue: trip.revenue ?? bookings * priceFrom * 0.85,
    conversionRate: trip.conversionRate ?? 3.2 + (bookings % 5) * 0.4,
    avgBookingValue: trip.avgBookingValue ?? priceFrom,
    cancellationRate: trip.cancellationRate ?? 2.1,
    rating: trip.rating ?? 4.5 + (bookings % 10) * 0.03,
    aiScore: trip.aiScore ?? 72 + (bookings % 28),
    seasonalTag: trip.seasonalTag ?? ["Summer", "Spring", "Winter", "Year-round"][bookings % 4],
    manager: trip.manager ?? "Operations Team",
    language: trip.language ?? "English",
    visaRequired: trip.visaRequired ?? false,
    currency: trip.currency ?? "EUR",
    bookingsPaused: trip.bookingsPaused ?? false,
    featured: trip.featured ?? false,
    homepageVisible: trip.homepageVisible ?? trip.featured ?? false,
    slug: trip.slug ?? (trip.id ? `${trip.id}-escape` : ""),
    metaTitle: trip.metaTitle ?? trip.title ?? "",
    metaDescription: trip.metaDescription ?? trip.description?.slice(0, 160) ?? "",
    pricing: trip.pricing ?? {
      base: priceFrom,
      discount: 0,
      seasonal: 0,
      child: Math.round(priceFrom * 0.6),
      taxes: Math.round(priceFrom * 0.08),
      hotel: Math.round(priceFrom * 0.45),
      flights: Math.round(priceFrom * 0.35),
      activities: Math.round(priceFrom * 0.12),
      total: priceFrom,
    },
    logistics: trip.logistics ?? {
      flightsIncluded: true,
      hotels: "Boutique 4★",
      pickupPoints: "Airport · City center",
      transport: "Private transfer",
      guideIncluded: true,
    },
    services: trip.services ?? { breakfast: true, airportTransfer: true, guidedTours: true },
    itinerary: trip.itinerary ?? [],
    activities: trip.activities ?? [],
    gallery: trip.gallery ?? (trip.image ? [trip.image] : []),
    auditLog: trip.auditLog ?? [],
    bookingTrend: trip.bookingTrend ?? [12, 18, 14, 22, 19, bookings % 30, Math.max(8, bookings % 25)],
    updatedAt: trip.updatedAt ?? Date.now(),
    createdAt: trip.createdAt ?? Date.now(),
  };
}

export function computeTripsOverview(trips) {
  const visible = trips.filter((t) => !t.deletedAt);
  const active = visible.filter((t) => ["active", "published"].includes(t.status));
  const revenueToday = visible.reduce((s, t) => s + (t.revenue ?? 0) * 0.02, 0);
  const monthlyBookings = visible.reduce((s, t) => s + (t.bookings ?? 0), 0);
  return {
    totalTrips: visible.length,
    activeTrips: active.length,
    revenueToday: Math.round(revenueToday),
    monthlyBookings,
    conversionRate: 4.8,
    aiInsight: "3 trips are underperforming — AI suggests seasonal pricing for Rome and Barcelona.",
  };
}

export const TRIP_FILTER_PILLS = [
  { id: "all", label: "All" },
  { id: "active", label: "Active" },
  { id: "draft", label: "Draft" },
  { id: "featured", label: "Featured" },
  { id: "archived", label: "Archived" },
];

export function filterTripsWorkspace(trips, { query, pill }) {
  let list = trips.filter((t) => !t.deletedAt);
  if (pill === "active") {
    list = list.filter((t) => ["active", "published"].includes(t.status));
  } else if (pill === "draft") {
    list = list.filter((t) => ["draft", "pending_review"].includes(t.status));
  } else if (pill === "featured") {
    list = list.filter((t) => t.featured || t.status === "featured");
  } else if (pill === "archived") {
    list = trips.filter((t) => t.status === "archived" || t.deletedAt);
  }
  const q = query?.trim().toLowerCase() ?? "";
  if (!q) return list;
  return list.filter((t) => {
    const hay = `${t.title} ${t.country} ${t.destination} ${t.style}`.toLowerCase();
    return hay.includes(q) || fuzzyMatch(hay, q);
  });
}

export function filterTrips(trips, filters) {
  const q = filters.query?.trim().toLowerCase() ?? "";
  return trips.filter((t) => {
    if (!filters.showDeleted && t.deletedAt) return false;
    if (filters.showDeleted && !t.deletedAt) return false;
    if (filters.destination !== "all" && t.country !== filters.destination) return false;
    if (filters.style !== "all" && t.style !== filters.style) return false;
    if (filters.status !== "all" && t.status !== filters.status) return false;
    if (filters.budget === "low" && t.priceFrom > 900) return false;
    if (filters.budget === "mid" && (t.priceFrom < 700 || t.priceFrom > 1500)) return false;
    if (filters.budget === "high" && t.priceFrom < 1500) return false;
    if (filters.minBookings && (t.bookings ?? 0) < Number(filters.minBookings)) return false;
    if (filters.minAiScore && (t.aiScore ?? 0) < Number(filters.minAiScore)) return false;
    if (filters.manager !== "all" && t.manager !== filters.manager) return false;
    if (filters.featuredOnly && !t.featured) return false;
    if (!q) return true;
    const hay = `${t.title} ${t.country} ${t.destination} ${t.style}`.toLowerCase();
    return hay.includes(q) || fuzzyMatch(hay, q);
  });
}

function fuzzyMatch(text, q) {
  return q.split("").every((c) => text.includes(c));
}

export function appendAudit(trip, action, detail = "") {
  const ts = new Date();
  return {
    auditLog: [
      {
        id: `audit-${Date.now()}`,
        action,
        detail,
        by: "Administrator",
        at: ts.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }),
      },
      ...(trip.auditLog ?? []),
    ],
    updatedAt: Date.now(),
  };
}
