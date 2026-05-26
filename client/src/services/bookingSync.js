import * as bookingsApi from "../api/bookingsApi.js";
import { apiBookingToLocal, localBookingToCreatePayload } from "../utils/bookingMappers.js";
import {
  BOOKING_STATUS,
  calculateBookingProgress,
  isPaidBookingStatus,
} from "../utils/bookingConstants.js";

function parseMetadata(json) {
  if (!json) return null;
  try {
    return typeof json === "string" ? JSON.parse(json) : json;
  } catch {
    return null;
  }
}

/** Stable key for deduping the same logical draft across local + API rows. */
export function bookingLogicalKey(booking) {
  if (booking?.serverId != null) return `server:${booking.serverId}`;
  if (booking?.id) return `local:${booking.id}`;
  return `trip:${booking?.destinationId ?? ""}|${booking?.start ?? ""}|${booking?.end ?? ""}|${booking?.total ?? 0}`;
}

function logicalKeyFromApiRow(row) {
  const id = row.id ?? row.Id;
  const ref = row.referenceCode ?? row.ReferenceCode;
  const meta = parseMetadata(row.metadataJson ?? row.MetadataJson);
  if (meta?.id) return `local:${meta.id}`;
  if (ref) return `local:${ref}`;
  return `server:${id}`;
}

/** Prefer the row with a server id, then the newest update. */
export function dedupeBookings(bookings) {
  const byKey = new Map();
  for (const booking of bookings) {
    const key = bookingLogicalKey(booking);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, booking);
      continue;
    }
    const prefer =
      (booking.serverId && !existing.serverId) ||
      (booking.serverId &&
        existing.serverId &&
        new Date(booking.updatedAt ?? booking.createdAt) >
          new Date(existing.updatedAt ?? existing.createdAt)) ||
      (!existing.serverId &&
        new Date(booking.updatedAt ?? booking.createdAt) >
          new Date(existing.updatedAt ?? existing.createdAt));
    if (prefer) byKey.set(key, booking);
  }
  return [...byKey.values()];
}

function isHiddenBooking(booking, hiddenKeys = []) {
  if (!hiddenKeys?.length) return false;
  const hidden = new Set(hiddenKeys.map(String));
  if (hidden.has(String(booking.id))) return true;
  if (booking.serverId != null && hidden.has(String(booking.serverId))) return true;
  return false;
}

function findExistingApiRow(items, booking) {
  const localRef = booking.bookingReference ?? booking.id;
  return items.find((row) => {
    const ref = row.referenceCode ?? row.ReferenceCode;
    if (ref && ref === localRef) return true;
    const meta = parseMetadata(row.metadataJson ?? row.MetadataJson);
    return meta?.id === booking.id;
  });
}

/**
 * Upload local bookings to Azure (deduped by referenceCode / metadata id). Call on login.
 * @param {string} accessToken
 * @param {object[]} localDrafts
 * @param {string[]} [hiddenKeys]
 */
export async function pushLocalBookingsToApi(accessToken, localDrafts = [], hiddenKeys = []) {
  const updated = [];
  for (const booking of localDrafts) {
    if (isHiddenBooking(booking, hiddenKeys)) continue;
    try {
      const serverId = await pushBookingToApi(accessToken, booking);
      updated.push(serverId ? { ...booking, serverId } : booking);
    } catch {
      updated.push(booking);
    }
  }
  return updated;
}

/**
 * Pull bookings from API and merge into local drafts (API wins on serverId match).
 * @param {string} accessToken
 * @param {object[]} localDrafts
 * @param {string[]} [hiddenKeys] local ids and/or server ids to omit
 */
export async function fetchMergedBookings(accessToken, localDrafts = [], hiddenKeys = []) {
  const data = await bookingsApi.listMyBookings(accessToken);
  const items = data.items ?? data.Items ?? [];
  const fromApi = items
    .map(apiBookingToLocal)
    .filter((b) => isPaidBookingStatus(b.status))
    .map((b) => ({
      ...b,
      progress: calculateBookingProgress(b),
    }));

  const byServerId = new Map(fromApi.filter((b) => b.serverId).map((b) => [b.serverId, b]));
  const byLogicalKey = new Map(fromApi.map((b) => [bookingLogicalKey(b), b]));
  const merged = [];
  const seenServer = new Set();
  const seenLogical = new Set();

  for (const local of localDrafts) {
    if (isHiddenBooking(local, hiddenKeys)) continue;

    if (local.serverId && byServerId.has(local.serverId)) {
      const remote = byServerId.get(local.serverId);
      merged.push(remote);
      seenServer.add(local.serverId);
      seenLogical.add(bookingLogicalKey(remote));
    } else if (!local.serverId) {
      const match = byLogicalKey.get(bookingLogicalKey(local));
      if (match?.serverId) {
        merged.push({ ...match, id: local.id });
        seenServer.add(match.serverId);
        seenLogical.add(bookingLogicalKey(match));
      } else {
        merged.push(local);
        seenLogical.add(bookingLogicalKey(local));
      }
    }
  }

  for (const remote of fromApi) {
    const key = bookingLogicalKey(remote);
    if (remote.serverId && seenServer.has(remote.serverId)) continue;
    if (seenLogical.has(key)) continue;
    if (isHiddenBooking(remote, hiddenKeys)) continue;
    merged.push(remote);
    if (remote.serverId) seenServer.add(remote.serverId);
    seenLogical.add(key);
  }

  return dedupeBookings(merged)
    .filter((b) => !isHiddenBooking(b, hiddenKeys))
    .sort(
      (a, b) => new Date(b.updatedAt ?? b.createdAt) - new Date(a.updatedAt ?? a.createdAt),
    );
}

/**
 * Cancel/discard on server when possible.
 * @param {string} accessToken
 * @param {object} booking
 */
export async function discardBookingOnApi(accessToken, booking) {
  if (!booking?.serverId) return;
  try {
    await bookingsApi.discardBooking(accessToken, booking.serverId);
  } catch {
    await bookingsApi.patchBookingStatus(accessToken, booking.serverId, "Cancelled");
  }
}

/**
 * Create or update booking on server; returns server id.
 * Reuses an existing row matched by referenceCode / metadata id to avoid duplicates.
 * @param {string} accessToken
 * @param {object} booking
 */
export async function pushBookingToApi(accessToken, booking) {
  const payload = localBookingToCreatePayload(booking);

  if (booking.serverId) {
    await bookingsApi.patchBooking(accessToken, booking.serverId, {
      itineraryId: payload.itineraryId ?? undefined,
      amount: payload.amount,
      currency: payload.currency,
      metadataJson: payload.metadataJson,
    });
    if (booking.status === "confirmed") {
      try {
        await bookingsApi.confirmBookingPayment(accessToken, booking.serverId);
      } catch {
        /* ignore */
      }
    }
    return booking.serverId;
  }

  const list = await bookingsApi.listMyBookings(accessToken);
  const items = list.items ?? list.Items ?? [];
  const existing = findExistingApiRow(items, booking);
  if (existing) {
    const serverId = existing.id ?? existing.Id;
    await bookingsApi.patchBooking(accessToken, serverId, {
      itineraryId: payload.itineraryId ?? undefined,
      amount: payload.amount,
      currency: payload.currency,
      metadataJson: payload.metadataJson,
    });
    return serverId;
  }

  const created = await bookingsApi.createBooking(accessToken, payload);
  const serverId = created.id ?? created.Id;
  if (booking.status === "confirmed") {
    try {
      await bookingsApi.confirmBookingPayment(accessToken, serverId);
    } catch {
      /* ignore */
    }
  }
  return serverId;
}

/** Dedupe admin API rows that share the same client draft id / reference code. */
export function dedupeApiBookingRows(items) {
  const byKey = new Map();
  for (const row of items) {
    const key = logicalKeyFromApiRow(row);
    const existing = byKey.get(key);
    const id = row.id ?? row.Id;
    const existingId = existing?.id ?? existing?.Id;
    if (!existing || Number(id) > Number(existingId)) {
      byKey.set(key, row);
    }
  }
  return [...byKey.values()];
}
