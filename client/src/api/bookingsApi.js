import { apiRequest } from "./client.js";

/** @param {string} accessToken */
export function listMyBookings(accessToken) {
  return apiRequest("/api/v1/bookings", { token: accessToken });
}

/** @param {string} accessToken @param {number} id */
export function getBooking(accessToken, id) {
  return apiRequest(`/api/v1/bookings/${id}`, { token: accessToken });
}

/** @param {string} accessToken @param {object} payload */
export function createBooking(accessToken, payload) {
  return apiRequest("/api/v1/bookings", {
    method: "POST",
    token: accessToken,
    json: payload,
  });
}

/** @param {string} accessToken @param {number} id @param {string} status */
export function patchBookingStatus(accessToken, id, status) {
  return apiRequest(`/api/v1/bookings/${id}/status`, {
    method: "PATCH",
    token: accessToken,
    json: { status },
  });
}

/** @param {string} accessToken @param {object} [query] */
export function searchBookings(accessToken, query = {}) {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  if (query.status) params.set("status", query.status);
  if (query.q) params.set("q", query.q);
  const qs = params.toString();
  return apiRequest(`/api/v1/bookings/search${qs ? `?${qs}` : ""}`, { token: accessToken });
}
