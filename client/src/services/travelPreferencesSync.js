import * as travelPreferencesApi from "../api/travelPreferencesApi.js";

/** @param {string[]} preferenceTags */
export function tagsToApiBody(preferenceTags) {
  const tags = (preferenceTags ?? []).map((t) => String(t).trim()).filter(Boolean);
  return {
    favoriteDestinationType: tags[0] ?? null,
    preferredTransport: tags.includes("adventure") ? "flight" : tags.includes("relaxed pace") ? "train" : null,
    preferredAccommodation: tags.includes("luxury") ? "luxury" : tags.includes("family") ? "family" : null,
    budgetMin: null,
    budgetMax: null,
  };
}

/** @param {object|null} api */
export function apiToPreferenceTags(api) {
  if (!api) return [];
  const tags = [];
  if (api.favoriteDestinationType ?? api.FavoriteDestinationType)
    tags.push(api.favoriteDestinationType ?? api.FavoriteDestinationType);
  if (api.preferredAccommodation ?? api.PreferredAccommodation)
    tags.push(api.preferredAccommodation ?? api.PreferredAccommodation);
  if (api.preferredTransport ?? api.PreferredTransport)
    tags.push(api.preferredTransport ?? api.PreferredTransport);
  return tags;
}

/** @param {string} accessToken @param {number} userId @param {string[]} tags */
export async function saveUserPreferences(accessToken, userId, tags, { asAdmin = false } = {}) {
  const body = tagsToApiBody(tags);
  if (asAdmin) {
    return travelPreferencesApi.upsertUserTravelPreferences(accessToken, userId, body);
  }
  return travelPreferencesApi.upsertMyTravelPreferences(accessToken, body);
}

/** @param {string} accessToken @param {number} userId @param {{ asAdmin?: boolean }} opts */
export async function loadUserPreferences(accessToken, userId, { asAdmin = false } = {}) {
  const api = asAdmin
    ? await travelPreferencesApi.getUserTravelPreferences(accessToken, userId)
    : await travelPreferencesApi.getMyTravelPreferences(accessToken);
  return apiToPreferenceTags(api);
}
