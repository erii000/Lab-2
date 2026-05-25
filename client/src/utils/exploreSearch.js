import { getCatalogDestinations, getDestinationById } from "../data/destinations.js";
import {
  normalizeQuery,
  resolveDestinationId,
  searchDestinations,
  tripParamsToSearchParams,
} from "./destinationSearch.js";

const EXPERIENCE_TO_TYPES = {
  romantic: ["Culture", "Food"],
  beach: ["Relaxing"],
  adventure: ["Adventure"],
  luxury: ["City", "Culture"],
  family: ["Culture", "City"],
};

export function formatExploreDateRange(start, end) {
  if (!start || !end) return "";
  const s = new Date(start);
  const e = new Date(end);
  const opts = { month: "short", day: "numeric" };
  return `${s.toLocaleDateString("en-GB", opts)} – ${e.toLocaleDateString("en-GB", opts)}`;
}

export function parseExploreParams(searchParams) {
  const destination =
    searchParams.get("destination") || searchParams.get("q") || "";
  return {
    destination,
    start: searchParams.get("start") || "",
    end: searchParams.get("end") || "",
    travelers: Math.max(1, Number(searchParams.get("travelers") || searchParams.get("guests")) || 2),
    budget: searchParams.get("budget") ? Number(searchParams.get("budget")) : null,
    tripType: searchParams.get("tripType") || "",
    experience: searchParams.get("experience") || "",
    weather: searchParams.get("weather") || "",
    activities: searchParams.get("activities") || "",
    sort: searchParams.get("sort") || "recommended",
  };
}

export function buildExploreSearchParams(criteria) {
  const params = new URLSearchParams();
  if (criteria.destination) params.set("destination", criteria.destination);
  Object.entries(tripParamsToSearchParams({
    start: criteria.start,
    end: criteria.end,
    guests: criteria.travelers,
    budget: criteria.budget,
  })).forEach(([k, v]) => params.set(k === "guests" ? "travelers" : k, v));
  if (criteria.tripType) params.set("tripType", criteria.tripType);
  if (criteria.experience) params.set("experience", criteria.experience);
  if (criteria.weather) params.set("weather", criteria.weather);
  if (criteria.activities) params.set("activities", criteria.activities);
  if (criteria.sort && criteria.sort !== "recommended") params.set("sort", criteria.sort);
  return params;
}

export function buildExploreUrl(criteria) {
  const qs = buildExploreSearchParams(criteria).toString();
  return `/explore${qs ? `?${qs}` : ""}`;
}

function matchesWeather(dest, weatherPref) {
  if (!weatherPref || weatherPref === "any") return true;
  const temp = dest.weather?.tempC ?? 18;
  if (weatherPref === "warm") return temp >= 20;
  if (weatherPref === "mild") return temp >= 14 && temp < 24;
  return true;
}

function matchesActivities(dest, activitiesPref) {
  if (!activitiesPref) return true;
  const q = normalizeQuery(activitiesPref);
  return (dest.activities ?? []).some(
    (a) =>
      normalizeQuery(a.category).includes(q) ||
      normalizeQuery(a.name).includes(q),
  );
}

function applySidebarFilters(list, filters) {
  const experienceTypes = filters.experience ? EXPERIENCE_TO_TYPES[filters.experience] : null;

  return list.filter((d) => {
    if (filters.budget != null && d.priceFrom > filters.budget) return false;
    if (filters.tripType && !d.tripTypes?.includes(filters.tripType)) return false;
    if (experienceTypes && !experienceTypes.some((t) => d.tripTypes?.includes(t))) return false;
    if (!matchesWeather(d, filters.weather)) return false;
    if (!matchesActivities(d, filters.activities)) return false;
    return true;
  });
}

function getAlternativeSuggestions(targetId, budget) {
  const destinations = getCatalogDestinations();
  const target = targetId ? getDestinationById(targetId) : null;
  const pool = destinations.filter((d) => d.id !== targetId);
  const suggestions = [];

  const cheaper = [...pool]
    .filter((d) => (budget ? d.priceFrom <= budget * 1.15 : d.priceFrom < (target?.priceFrom ?? 9999)))
    .sort((a, b) => a.priceFrom - b.priceFrom)
    .slice(0, 2)
    .map((d) => ({ ...d, suggestReason: budget ? "Better for your budget" : "Lower cost option" }));

  const similarVibe = [...pool]
    .filter((d) =>
      target
        ? d.tripTypes?.some((t) => target.tripTypes?.includes(t)) || d.region === target.region
        : true,
    )
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 2)
    .map((d) => ({
      ...d,
      suggestReason: target ? `Similar to ${target.title}` : "Similar destinations",
    }));

  const nearby = [...pool]
    .filter((d) => target && d.region === target.region)
    .slice(0, 1)
    .map((d) => ({ ...d, suggestReason: "Nearby destination" }));

  const ids = new Set();
  [...similarVibe, ...cheaper, ...nearby].forEach((d) => {
    if (!ids.has(d.id)) {
      ids.add(d.id);
      suggestions.push(d);
    }
  });

  if (suggestions.length < 4) {
    destinations
      .filter((d) => d.id !== targetId && !ids.has(d.id))
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 6 - suggestions.length)
      .forEach((d) => {
        suggestions.push({ ...d, suggestReason: "Curated by AI" });
      });
  }

  return suggestions.slice(0, 6);
}

export function runExploreSearch(filters) {
  const query = filters.destination?.trim() || "";
  const resolvedId = resolveDestinationId(query);
  const budget = filters.budget;

  let exact = searchDestinations({
    query,
    budget: budget ?? undefined,
    tripType: filters.tripType || undefined,
    maxResults: 24,
  });

  exact = applySidebarFilters(exact, filters);

  const strictForCity =
    resolvedId &&
    exact.some((d) => d.id === resolvedId) &&
    (!budget || getDestinationById(resolvedId)?.priceFrom <= budget);

  let mode = "exact";
  let results = exact;
  let alternatives = [];

  if (!exact.length || (resolvedId && !strictForCity)) {
    mode = "alternatives";
    alternatives = getAlternativeSuggestions(resolvedId, budget);
    alternatives = applySidebarFilters(alternatives, { ...filters, budget: null });
    if (!alternatives.length) {
      const destinations = getCatalogDestinations();
      alternatives = applySidebarFilters(
        [...destinations].sort((a, b) => a.priceFrom - b.priceFrom),
        { ...filters, budget: null },
      ).slice(0, 6);
    }
    results = alternatives;
  }

  return {
    mode,
    exact,
    alternatives,
    results,
    resolvedId,
    aiInsight: buildAiInsight(resolvedId, query, budget, mode),
  };
}

function buildAiInsight(resolvedId, query, budget, mode) {
  const dest = resolvedId ? getDestinationById(resolvedId) : null;
  if (mode === "alternatives" && dest && budget && dest.priceFrom > budget) {
    return `${dest.title} trips often start above €${budget}. Try similar cities below or raise your budget slightly.`;
  }
  if (dest?.id === "tokyo" && budget && budget < 1000) {
    return "Tokyo is premium this season. Rome or Istanbul offer rich culture at lower price points.";
  }
  if (mode === "exact" && dest) {
    return "Traveling one week later could save up to 18% on flights for this route.";
  }
  if (query) {
    return `Showing the best matches for “${query}”. Adjust budget or dates in filters — results update instantly.`;
  }
  return "Explore curated trips worldwide. Refine filters anytime without leaving this page.";
}

export function sortExploreResults(list, sortBy) {
  const copy = [...list];
  switch (sortBy) {
    case "price-low":
      return copy.sort((a, b) => a.priceFrom - b.priceFrom);
    case "price-high":
      return copy.sort((a, b) => b.priceFrom - a.priceFrom);
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    default:
      return copy.sort((a, b) => b.rating * 10 - a.priceFrom / 100 - (b.rating * 10 - b.priceFrom / 100));
  }
}

export function getTrendingDestinations() {
  return ["barcelona", "paris", "tokyo", "rome", "dubai", "bali"]
    .map((id) => getDestinationById(id))
    .filter(Boolean);
}

export function getDiscoveryGroups(query) {
  const q = normalizeQuery(query);
  const ref = resolveDestinationId(query);
  const refDest = ref ? getDestinationById(ref) : null;

  return [
    {
      id: "similar",
      label: refDest ? `Similar to ${refDest.title}` : "Similar destinations",
      filter: { experience: "romantic" },
    },
    { id: "budget", label: "Better for your budget", filter: { sort: "price-low" } },
    { id: "trending", label: "Trending this month", filter: {} },
    { id: "couples", label: "Great for couples", filter: { experience: "romantic" } },
    { id: "luxury", label: "Luxury escapes", filter: { experience: "luxury" } },
    { id: "hidden", label: "Hidden gems", filter: { tripType: "Culture" } },
  ].filter((g) => !q || g.id !== "similar" || refDest);
}

import { getRecentSearches, useExploreStore } from "../store/exploreStore.js";

export function pushRecentSearch(criteria) {
  useExploreStore.getState().pushRecentSearch(criteria);
}

export function loadRecentSearches() {
  return getRecentSearches();
}

export function mapDestinationToCard(dest) {
  const badge = dest.priceFrom <= 650 ? "Budget Friendly" : dest.tag || "Trending";
  return {
    id: dest.id,
    title: dest.title,
    country: dest.country,
    image: dest.image,
    priceFrom: dest.priceFrom,
    rating: dest.rating,
    aiSummary: dest.aiItineraryTeaser || dest.description?.slice(0, 90),
    badge: dest.suggestReason || badge,
    description: dest.description,
  };
}
