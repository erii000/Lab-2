import { apiRequest } from "./client.js";

/** @param {string} accessToken */
export function listSavedDestinations(accessToken) {
  return apiRequest("/api/v1/saved-destinations", { token: accessToken });
}

/** @param {string} accessToken */
export function saveDestination(accessToken, slug) {
  return apiRequest(`/api/v1/saved-destinations/${encodeURIComponent(slug)}`, {
    method: "PUT",
    token: accessToken,
  });
}

/** @param {string} accessToken */
export function removeSavedDestination(accessToken, slug) {
  return apiRequest(`/api/v1/saved-destinations/${encodeURIComponent(slug)}`, {
    method: "DELETE",
    token: accessToken,
  });
}
