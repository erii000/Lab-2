import { BOOKING_STATUS } from "./bookingConstants.js";
import { getDestinationById } from "../data/destinations.js";

const API_TO_CLIENT_STATUS = {
  Pending: BOOKING_STATUS.PENDING_PAYMENT,
  Confirmed: BOOKING_STATUS.CONFIRMED,
  Completed: BOOKING_STATUS.COMPLETED,
  Cancelled: BOOKING_STATUS.CANCELLED,
};

const CLIENT_TO_API_STATUS = {
  [BOOKING_STATUS.DRAFT]: "Pending",
  [BOOKING_STATUS.TRAVELER_INFO_COMPLETED]: "Pending",
  [BOOKING_STATUS.PENDING_PAYMENT]: "Pending",
  [BOOKING_STATUS.CONFIRMED]: "Confirmed",
  [BOOKING_STATUS.COMPLETED]: "Completed",
  [BOOKING_STATUS.CANCELLED]: "Cancelled",
};

const ADMIN_API_TO_STORE = {
  Pending: "pending",
  Confirmed: "confirmed",
  Completed: "confirmed",
  Cancelled: "cancelled",
};

const ADMIN_STORE_TO_API = {
  pending: "Pending",
  confirmed: "Confirmed",
  paid: "Confirmed",
  cancelled: "Cancelled",
  refunded: "Cancelled",
  partially_refunded: "Cancelled",
};

export function clientStatusToApi(status) {
  return CLIENT_TO_API_STATUS[status] ?? "Pending";
}

export function adminStatusToApi(status) {
  return ADMIN_STORE_TO_API[status] ?? "Pending";
}

export function apiStatusToClient(status) {
  return API_TO_CLIENT_STATUS[status] ?? BOOKING_STATUS.DRAFT;
}

export function apiStatusToAdminStore(status) {
  return ADMIN_API_TO_STORE[status] ?? "pending";
}

function parseMetadata(json) {
  if (!json) return null;
  try {
    return typeof json === "string" ? JSON.parse(json) : json;
  } catch {
    return null;
  }
}

/** @param {object} api row from BookingService */
export function apiBookingToLocal(api) {
  const meta = parseMetadata(api.metadataJson ?? api.MetadataJson);
  if (meta && typeof meta === "object" && meta.id) {
    return {
      ...meta,
      serverId: api.id ?? api.Id,
      status: apiStatusToClient(api.status ?? api.Status),
      bookingReference: api.referenceCode ?? api.ReferenceCode ?? meta.bookingReference,
      total: api.amount ?? api.Amount ?? meta.total,
      updatedAt: new Date().toISOString(),
    };
  }

  const id = api.id ?? api.Id;
  const bookingDate = api.bookingDate ?? api.BookingDate;
  return {
    id: `api-${id}`,
    serverId: id,
    createdAt: bookingDate ? `${bookingDate}T12:00:00.000Z` : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: apiStatusToClient(api.status ?? api.Status),
    source: "api",
    destinationId: null,
    destinationTitle: api.bookingType ?? api.BookingType ?? "Trip",
    destinationImage: null,
    packageTitle: api.bookingType ?? api.BookingType ?? "Trip",
    start: bookingDate ?? "",
    end: bookingDate ?? "",
    guests: 2,
    total: Number(api.amount ?? api.Amount ?? 0),
    lineItems: [],
    traveler: { fullName: "", passport: "", nationality: "", email: "", phone: "" },
    bookingReference: api.referenceCode ?? api.ReferenceCode ?? null,
  };
}

function truncateField(value, maxLen, fallback = "") {
  const text = String(value ?? fallback).trim() || fallback;
  return text.length <= maxLen ? text : text.slice(0, maxLen);
}

/** @param {object} booking local draft */
export function localBookingToCreatePayload(booking) {
  return {
    bookingType: truncateField(
      booking.destinationTitle ?? booking.packageTitle ?? "package",
      50,
      "package",
    ),
    provider: "SmartTravel",
    referenceCode: truncateField(booking.bookingReference ?? booking.id, 100, "ref"),
    amount: booking.total ?? 0,
    currency: "EUR",
    itineraryId: booking.itineraryId ?? null,
    metadataJson: JSON.stringify(booking),
  };
}

/** @param {object} api @param {Map<number, {name: string, email: string}>} [usersById] */
export function apiBookingToAdmin(api, usersById = new Map()) {
  const meta = parseMetadata(api.metadataJson ?? api.MetadataJson);
  const userId = api.userId ?? api.UserId;
  const userFromMap = usersById.get(userId);
  const traveler = meta?.traveler ?? {};
  const id = api.id ?? api.Id;

  return {
    id: `BK-${id}`,
    serverId: id,
    user: userFromMap?.name ?? traveler.fullName ?? `User #${userId}`,
    email: userFromMap?.email ?? traveler.email ?? "",
    destination: meta?.destinationTitle ?? api.bookingType ?? api.BookingType ?? "—",
    travelDates: meta?.startLabel && meta?.endLabel ? `${meta.startLabel} → ${meta.endLabel}` : "—",
    travelers: meta?.guests ?? 2,
    amount: Number(api.amount ?? api.Amount ?? meta?.total ?? 0),
    status: apiStatusToAdminStore(api.status ?? api.Status),
    paymentMethod: meta?.paymentMethod ?? "card",
    invoice: `INV-${id}`,
    traveler: {
      fullName: traveler.fullName ?? userFromMap?.name ?? "",
      passport: traveler.passport ?? "",
      email: traveler.email ?? userFromMap?.email ?? "",
      phone: traveler.phone ?? "",
    },
    itinerarySummary: meta?.packageTitle ?? api.bookingType ?? "",
  };
}

function catalogImageForDestination(label) {
  const hay = String(label ?? "").toLowerCase();
  const catalog = [
    getDestinationById("paris"),
    getDestinationById("tokyo"),
    getDestinationById("barcelona"),
    getDestinationById("rome"),
    getDestinationById("sydney"),
    getDestinationById("dubai"),
    getDestinationById("london"),
    getDestinationById("istanbul"),
    getDestinationById("new-york"),
  ].filter(Boolean);
  const match = catalog.find(
    (d) => hay.includes(d.id) || hay.includes(String(d.title).toLowerCase()),
  );
  return match?.image ?? "";
}

/** @param {object[]} items from itineraries search */
export function apiTripToAdmin(item) {
  const destLabel = (item.destinations ?? item.Destinations ?? []).join(", ") || "—";
  const destKey = destLabel.split(",")[0]?.trim() ?? "";
  const start = item.startDate ?? item.StartDate;
  const end = item.endDate ?? item.EndDate;
  const image = catalogImageForDestination(destKey || item.title);
  return {
    id: `trip-${item.id ?? item.Id}`,
    serverId: item.id ?? item.Id,
    title: item.title ?? item.Title,
    subtitle: destLabel,
    destination: destKey,
    country: destLabel,
    days: start && end ? Math.max(1, Math.round((new Date(end) - new Date(start)) / 86400000)) : 4,
    priceFrom: Number(item.budget ?? item.Budget ?? 0),
    bookings: 0,
    image,
    gallery: image ? [image] : [],
    description: "",
    status: (item.status ?? item.Status ?? "draft").toLowerCase().replace(/\s+/g, "_"),
    budget: item.budget ?? item.Budget,
    userId: item.userId ?? item.UserId,
  };
}
