import { apiRequest } from "./client.js";

/** @param {string} accessToken @param {object} [query] */
export function searchTrips(accessToken, query = {}) {
  const params = new URLSearchParams();
  if (query.page) params.set("page", String(query.page));
  if (query.pageSize) params.set("pageSize", String(query.pageSize));
  if (query.q) params.set("q", query.q);
  if (query.status) params.set("status", query.status);
  const qs = params.toString();
  return apiRequest(`/api/v1/itineraries/search${qs ? `?${qs}` : ""}`, { token: accessToken });
}

/** @param {string} accessToken @param {object} body */
export function generateItinerary(accessToken, body) {
  return apiRequest("/api/v1/itineraries/generate", {
    method: "POST",
    token: accessToken,
    json: body,
  });
}
