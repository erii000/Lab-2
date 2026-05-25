import * as bookingsApi from "../api/bookingsApi.js";
import {
  apiBookingToLocal,
  clientStatusToApi,
  localBookingToCreatePayload,
} from "../utils/bookingMappers.js";
import { calculateBookingProgress } from "../utils/bookingConstants.js";

/**
 * Pull bookings from API and merge into local drafts (API wins on serverId match).
 * @param {string} accessToken
 * @param {object[]} localDrafts
 */
export async function fetchMergedBookings(accessToken, localDrafts = []) {
  const data = await bookingsApi.listMyBookings(accessToken);
  const items = data.items ?? data.Items ?? [];
  const fromApi = items.map(apiBookingToLocal).map((b) => ({
    ...b,
    progress: calculateBookingProgress(b),
  }));

  const byServerId = new Map(fromApi.filter((b) => b.serverId).map((b) => [b.serverId, b]));
  const merged = [];
  const seenServer = new Set();

  for (const local of localDrafts) {
    if (local.serverId && byServerId.has(local.serverId)) {
      merged.push(byServerId.get(local.serverId));
      seenServer.add(local.serverId);
    } else if (!local.serverId) {
      merged.push(local);
    }
  }

  for (const remote of fromApi) {
    if (remote.serverId && !seenServer.has(remote.serverId)) {
      merged.push(remote);
    }
  }

  return merged.sort(
    (a, b) => new Date(b.updatedAt ?? b.createdAt) - new Date(a.updatedAt ?? a.createdAt),
  );
}

/**
 * Create or update booking on server; returns server id.
 * @param {string} accessToken
 * @param {object} booking
 */
export async function pushBookingToApi(accessToken, booking) {
  if (booking.serverId) {
    const apiStatus = clientStatusToApi(booking.status);
    await bookingsApi.patchBookingStatus(accessToken, booking.serverId, apiStatus);
    return booking.serverId;
  }

  const created = await bookingsApi.createBooking(accessToken, localBookingToCreatePayload(booking));
  const serverId = created.id ?? created.Id;
  if (booking.status && booking.status !== "draft") {
    await bookingsApi.patchBookingStatus(accessToken, serverId, clientStatusToApi(booking.status));
  }
  return serverId;
}
