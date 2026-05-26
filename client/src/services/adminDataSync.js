import * as bookingsApi from "../api/bookingsApi.js";
import * as destinationsApi from "../api/destinationsApi.js";
import * as usersApi from "../api/usersApi.js";
import { getCatalogDestinations } from "../data/destinations.js";
import { apiBookingToAdmin } from "../utils/bookingMappers.js";
import { enrichBooking } from "../utils/adminBookingActivity.js";
import { enrichTrip } from "../utils/adminTrips.js";
import { enrichUser } from "../utils/adminUsers.js";
import { dedupeApiBookingRows } from "./bookingSync.js";
import { buildCatalogAdminTrips, countBookingsByCatalogId } from "../utils/catalogAdminTrips.js";
import { formatDisplayName } from "../utils/displayName.js";

const PAID_BOOKING_STATUSES = new Set([
  "Confirmed",
  "Completed",
  "confirmed",
  "completed",
  "Paid",
  "paid",
]);

const CANCELLED_STATUSES = new Set(["Cancelled", "cancelled", "Refunded", "refunded"]);

/** Admin lists: paid/completed/cancelled — never unpaid Pending drafts. */
export function isAdminVisibleApiBooking(row) {
  const status = String(row.status ?? row.Status ?? "");
  if (!status || status === "Pending") return false;
  return PAID_BOOKING_STATUSES.has(status) || CANCELLED_STATUSES.has(status);
}

function parseMetadata(json) {
  if (!json) return null;
  try {
    return typeof json === "string" ? JSON.parse(json) : json;
  } catch {
    return null;
  }
}

function normalizeUserId(userId) {
  const n = Number(userId);
  return Number.isFinite(n) ? n : null;
}

function formatLastActive(iso) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return date.toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" });
}

/** Trips column = confirmed/paid bookings; bookings column = all non-cancelled reservations. */
function aggregateUserMetrics(bookingRows) {
  const byUser = new Map();

  for (const row of bookingRows) {
    const userId = normalizeUserId(row.userId ?? row.UserId);
    if (userId == null) continue;

    const entry = byUser.get(userId) ?? {
      trips: 0,
      bookings: 0,
      totalSpent: 0,
      lastActiveAt: null,
      favoriteDestination: null,
      bookingHistory: [],
    };

    const status = String(row.status ?? row.Status ?? "");
    const amount = Number(row.amount ?? row.Amount ?? 0);
    const cancelled = CANCELLED_STATUSES.has(status);

    if (!cancelled) {
      entry.bookings += 1;
    }

    if (PAID_BOOKING_STATUSES.has(status)) {
      entry.totalSpent += amount;
      entry.trips += 1;
    }

    const meta = parseMetadata(row.metadataJson ?? row.MetadataJson);
    const destination =
      meta?.destinationTitle ?? meta?.packageTitle ?? row.bookingType ?? row.BookingType;
    if (destination && !entry.favoriteDestination) {
      entry.favoriteDestination = destination;
    }

    const updatedAt = row.updatedAt ?? row.UpdatedAt ?? row.bookingDate ?? row.BookingDate;
    const updatedMs = updatedAt ? new Date(updatedAt).getTime() : 0;
    if (updatedMs && (!entry.lastActiveAt || updatedMs > entry.lastActiveAt)) {
      entry.lastActiveAt = updatedMs;
    }

    entry.bookingHistory.push({
      id: row.id ?? row.Id,
      destination: destination ?? "Trip",
      dates:
        meta?.startLabel && meta?.endLabel
          ? `${meta.startLabel} – ${meta.endLabel}`
          : "—",
      amount,
      status,
    });

    byUser.set(userId, entry);
  }

  for (const entry of byUser.values()) {
    entry.bookingHistory.sort((a, b) => String(b.id).localeCompare(String(a.id)));
  }

  return byUser;
}

function mapApiUser(row, metrics = null) {
  const roles = row.roles ?? row.Roles ?? [];
  const primaryRole = roles[0] ?? "Traveler";
  const first = row.firstName ?? row.FirstName ?? "";
  const last = row.lastName ?? row.LastName ?? "";
  const email = row.email ?? row.Email ?? "";
  const userId = normalizeUserId(row.id ?? row.Id);
  const stats = userId != null ? metrics?.get(userId) : null;

  return enrichUser({
    id: String(userId ?? row.id ?? row.Id),
    name: formatDisplayName(first, last, email),
    email,
    role: primaryRole,
    travelerStatus: row.isActive === false || row.IsActive === false ? "inactive" : "active",
    trips: stats?.trips ?? 0,
    bookings: stats?.bookings ?? 0,
    totalSpent: stats?.totalSpent ?? 0,
    lastActive: stats?.lastActiveAt ? formatLastActive(stats.lastActiveAt) : "—",
    favoriteDestination: stats?.favoriteDestination ?? "—",
    averageBudget: stats?.trips ? Math.round((stats.totalSpent ?? 0) / stats.trips) : 0,
    preferences: [],
    savedTrips: [],
    bookingHistory: stats?.bookingHistory ?? [],
    accountStatus: row.isActive === false || row.IsActive === false ? "deactivated" : "active",
  });
}

export async function fetchAdminBookings(accessToken, hiddenBookingIds = []) {
  const data = await bookingsApi.searchBookings(accessToken, { page: 1, pageSize: 500 });
  const rawItems = data.items ?? data.Items ?? [];
  const items = dedupeApiBookingRows(rawItems).filter(isAdminVisibleApiBooking);
  const hidden = new Set(hiddenBookingIds.map(String));
  let usersById = new Map();
  try {
    const usersData = await usersApi.listUsers(accessToken, { pageNumber: 1, pageSize: 500 });
    const users = usersData.items ?? usersData.Items ?? [];
    usersById = new Map(
      users.map((u) => {
        const id = u.id ?? u.Id;
        const email = u.email ?? u.Email ?? "";
        return [
          id,
          {
            name: formatDisplayName(u.firstName ?? u.FirstName, u.lastName ?? u.LastName, email),
            email,
          },
        ];
      }),
    );
  } catch {
    /* users optional for labels */
  }
  return items
    .map((row) => enrichBooking(apiBookingToAdmin(row, usersById)))
    .filter((b) => !hidden.has(String(b.id)) && !hidden.has(String(b.serverId)));
}

/** Sellable packages from destination catalog (same as homepage), with live booking counts. */
export async function fetchAdminTrips(accessToken) {
  let bookingRows = [];
  try {
    const data = await bookingsApi.searchBookings(accessToken, { page: 1, pageSize: 500 });
    bookingRows = (data.items ?? data.Items ?? []).filter(isAdminVisibleApiBooking);
  } catch {
    bookingRows = [];
  }
  const bookingCountByDestId = countBookingsByCatalogId(bookingRows);
  let catalog = getCatalogDestinations();
  try {
    const fromApi = await destinationsApi.listDestinations();
    if (Array.isArray(fromApi) && fromApi.length) catalog = fromApi;
  } catch {
    /* fallback catalog */
  }
  return buildCatalogAdminTrips(bookingCountByDestId, catalog);
}

export async function fetchAdminUsers(accessToken) {
  const [usersResult, bookingsResult] = await Promise.all([
    usersApi.listUsers(accessToken, { pageNumber: 1, pageSize: 500 }),
    bookingsApi.searchBookings(accessToken, { page: 1, pageSize: 500 }).catch(() => ({ items: [] })),
  ]);

  const users = usersResult.items ?? usersResult.Items ?? [];
  const bookingRows = (bookingsResult.items ?? bookingsResult.Items ?? []).filter(
    isAdminVisibleApiBooking,
  );
  const metrics = aggregateUserMetrics(bookingRows);

  return users.map((row) => mapApiUser(row, metrics));
}
