import { apiRequest } from "./client.js";

/** @returns {Promise<object[]>} */
export function listDestinations() {
  return apiRequest("/api/v1/destinations");
}

/** @param {string} slug @returns {Promise<object>} */
export function getDestination(slug) {
  return apiRequest(`/api/v1/destinations/${encodeURIComponent(slug)}`);
}

/** @param {string} accessToken @param {string} slug @param {object} adminMeta */
export function patchDestinationAdminMeta(accessToken, slug, adminMeta) {
  return apiRequest(`/api/v1/destinations/${encodeURIComponent(slug)}/admin-meta`, {
    method: "PATCH",
    token: accessToken,
    json: adminMeta,
  });
}
