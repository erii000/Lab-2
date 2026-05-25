import { getCatalogDestinations } from "../data/destinations.js";

const STYLE_KEYWORDS = {
  romantic: ["romantic", "couple", "honeymoon", "paris", "venice"],
  adventure: ["adventure", "hike", "tokyo", "sydney", "explore"],
  luxury: ["luxury", "dubai", "premium", "5★", "spa"],
  family: ["family", "kids", "beach", "culture"],
  budget: ["budget", "value", "affordable"],
};

/**
 * ML-style scoring engine (collaborative + content-based heuristic).
 * Simulates a recommendation model using user signals — no external API required.
 */
export function buildUserTravelProfile({ savedDestinationIds = [], recentSearches = [], bookings = [] }) {
  const destinations = getCatalogDestinations();
  const destinationCounts = {};
  const budgetSamples = [];
  const styleVotes = {};

  savedDestinationIds.forEach((id) => {
    destinationCounts[id] = (destinationCounts[id] ?? 0) + 3;
  });

  recentSearches.forEach((entry) => {
    const dest = entry.criteria?.destination;
    if (dest) {
      const match = destinations.find((d) =>
        d.title.toLowerCase().includes(dest.toLowerCase().slice(0, 4)),
      );
      if (match) destinationCounts[match.id] = (destinationCounts[match.id] ?? 0) + 2;
    }
    if (entry.criteria?.budget) budgetSamples.push(Number(entry.criteria.budget));
    if (entry.criteria?.experience) styleVotes[entry.criteria.experience] = (styleVotes[entry.criteria.experience] ?? 0) + 1;
  });

  bookings.forEach((b) => {
    if (b.destinationId) destinationCounts[b.destinationId] = (destinationCounts[b.destinationId] ?? 0) + 4;
    if (b.total) budgetSamples.push(b.total / Math.max(1, b.guests ?? 2));
  });

  const topStyle = Object.entries(styleVotes).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "luxury";
  const avgBudget =
    budgetSamples.length > 0
      ? budgetSamples.reduce((s, n) => s + n, 0) / budgetSamples.length
      : 1200;

  return { destinationCounts, topStyle, avgBudget };
}

export function scoreDestination(dest, profile) {
  let score = 50;
  const affinity = profile.destinationCounts[dest.id] ?? 0;
  score += affinity * 8;

  const priceDelta = Math.abs(dest.priceFrom - profile.avgBudget);
  score += Math.max(0, 25 - priceDelta / 40);

  const keywords = STYLE_KEYWORDS[profile.topStyle] ?? [];
  const blob = `${dest.title} ${dest.country} ${dest.tag} ${(dest.highlights ?? []).join(" ")}`.toLowerCase();
  if (keywords.some((k) => blob.includes(k))) score += 18;

  if (dest.weather?.tempC >= 22) score += 5;
  if (dest.priceFrom <= profile.avgBudget * 1.1) score += 6;

  return Math.min(99, Math.round(score));
}

export function getPersonalizedRecommendations(signals, { limit = 6 } = {}) {
  const destinations = getCatalogDestinations();
  const profile = buildUserTravelProfile(signals);
  const seen = new Set(signals.savedDestinationIds ?? []);

  return destinations
    .map((dest) => ({
      destination: dest,
      score: scoreDestination(dest, profile),
      reasons: buildReasons(dest, profile),
    }))
    .filter((r) => !seen.has(r.destination.id) || r.score >= 75)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function buildReasons(dest, profile) {
  const reasons = [];
  if (profile.destinationCounts[dest.id]) reasons.push("Matches your saved interests");
  if (dest.priceFrom <= profile.avgBudget) reasons.push("Within your typical budget");
  if (profile.topStyle) reasons.push(`Aligned with ${profile.topStyle} travel style`);
  if (reasons.length === 0) reasons.push("Trending with similar travelers");
  return reasons.slice(0, 2);
}
