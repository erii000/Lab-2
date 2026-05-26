import * as savedApi from "../api/savedDestinationsApi.js";

/**
 * @param {string} accessToken
 * @returns {Promise<string[]>}
 */
export async function fetchSavedDestinationSlugs(accessToken) {
  const rows = await savedApi.listSavedDestinations(accessToken);
  if (!Array.isArray(rows)) return [];
  return rows.map((s) => String(s).toLowerCase());
}

/**
 * @param {string} accessToken
 * @param {string[]} localSlugs
 */
export async function pushLocalSavedDestinations(accessToken, localSlugs) {
  const unique = [...new Set((localSlugs ?? []).map((s) => String(s).toLowerCase()).filter(Boolean))];
  await Promise.all(unique.map((slug) => savedApi.saveDestination(accessToken, slug).catch(() => null)));
}

/**
 * @param {string} accessToken
 * @param {string} slug
 * @param {boolean} saved
 */
export async function syncSavedDestinationToggle(accessToken, slug, saved) {
  const normalized = String(slug).toLowerCase();
  if (saved) {
    await savedApi.saveDestination(accessToken, normalized);
  } else {
    await savedApi.removeSavedDestination(accessToken, normalized);
  }
}
