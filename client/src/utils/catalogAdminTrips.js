import { featuredDestinationIds } from "../components/home/homeData.js";
import { getCatalogDestinations } from "../data/destinations.js";
import { enrichTrip } from "./adminTrips.js";

/** Display titles aligned with marketing / homepage packages. */
export const CATALOG_TRIP_TITLES = {
  paris: "Paris Escape",
  tokyo: "Tokyo City Break",
  rome: "Roman Holiday",
  sydney: "Sydney Premium",
  barcelona: "Barcelona City Break",
  dubai: "Dubai Luxe",
  bali: "Bali Escape",
  london: "London Escape",
  istanbul: "Istanbul Escape",
  "new-york": "New York Escape",
};

/**
 * Map a booking row to a catalog destination id for stats.
 * @param {object|null} meta parsed MetadataJson
 * @param {string} [bookingType]
 */
export function resolveCatalogIdFromBooking(meta, bookingType = "") {
  const catalog = getCatalogDestinations();
  const destId = meta?.destinationId ?? meta?.destination_id;
  if (destId && catalog.some((d) => d.id === destId)) return destId;

  const haystack = `${meta?.destinationTitle ?? ""} ${bookingType ?? ""}`.toLowerCase();
  if (!haystack.trim()) return null;

  const byAlias = catalog.find(
    (d) =>
      haystack.includes(String(d.id).toLowerCase()) ||
      haystack.includes(String(d.title).toLowerCase()),
  );
  return byAlias?.id ?? null;
}

/**
 * @param {Map<string, number>} bookingCountByDestId
 * @param {object[]} [catalogSource]
 */
export function buildCatalogAdminTrips(bookingCountByDestId = new Map(), catalogSource = null) {
  const catalog = catalogSource?.length ? catalogSource : getCatalogDestinations();
  const featuredSet = new Set(featuredDestinationIds);

  const ordered = [
    ...featuredDestinationIds
      .map((id) => catalog.find((d) => d.id === id))
      .filter(Boolean),
    ...catalog.filter((d) => !featuredSet.has(d.id)),
  ];

  return ordered.map((d, index) => {
    const bookings = bookingCountByDestId.get(d.id) ?? 0;
    const featured = featuredSet.has(d.id);
    const meta = d.adminMeta ?? {};
    const title = meta.title ?? CATALOG_TRIP_TITLES[d.id] ?? `${d.title} Journey`;

    return enrichTrip({
      id: d.id,
      serverId: null,
      title,
      subtitle: meta.subtitle ?? d.tag ?? "Luxury Getaway",
      destination: d.title,
      country: d.country,
      days: meta.days ?? d.days ?? 4 + (index % 3),
      priceFrom: d.priceFrom ?? 0,
      bookings,
      image: d.image ?? "",
      gallery: d.gallery?.length ? d.gallery : d.image ? [d.image] : [],
      description: d.description ?? "",
      aiSummary: d.description ?? "",
      style: (meta.style ?? d.tripTypes?.[0] ?? "luxury").toLowerCase(),
      capacity: meta.capacity ?? 24,
      status:
        meta.status ??
        (featured ? "published" : bookings > 0 ? "active" : "draft"),
      featured: meta.featured ?? featured,
      homepageVisible: meta.homepageVisible ?? featured,
      budgetMin: Math.max(0, (d.priceFrom ?? 0) - 200),
      budgetMax: (d.priceFrom ?? 0) + 800,
      activities: (d.activities ?? []).slice(0, 4).map((a) => ({ ...a })),
    });
  });
}

/**
 * @param {object[]} bookingRows raw API booking items
 */
export function countBookingsByCatalogId(bookingRows) {
  const counts = new Map();
  for (const row of bookingRows) {
    let meta = null;
    try {
      const raw = row.metadataJson ?? row.MetadataJson;
      meta = raw ? (typeof raw === "string" ? JSON.parse(raw) : raw) : null;
    } catch {
      meta = null;
    }
    const destId = resolveCatalogIdFromBooking(meta, row.bookingType ?? row.BookingType);
    if (!destId) continue;
    counts.set(destId, (counts.get(destId) ?? 0) + 1);
  }
  return counts;
}
