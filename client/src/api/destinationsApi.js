import { apiRequest } from "./client.js";

/** @returns {Promise<object[]>} */
export function listDestinations() {
  return apiRequest("/api/v1/destinations");
}

/** @param {string} slug @returns {Promise<object>} */
export function getDestination(slug) {
  return apiRequest(`/api/v1/destinations/${encodeURIComponent(slug)}`);
}
