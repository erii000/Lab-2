import { create } from "zustand";
import * as destinationsApi from "../api/destinationsApi.js";
import { FALLBACK_DESTINATIONS } from "../data/destinationsFallback.js";

/** Normalize API catalog rows (camelCase + legacy PascalCase from older seeds). */
export function normalizeDestination(raw) {
  if (!raw || typeof raw !== "object") return raw;
  return {
    ...raw,
    id: raw.id ?? raw.Id,
    title: raw.title ?? raw.Title,
    country: raw.country ?? raw.Country,
    image: raw.image ?? raw.Image,
    description: raw.description ?? raw.Description,
    priceFrom: raw.priceFrom ?? raw.PriceFrom,
    rating: raw.rating ?? raw.Rating,
    reviewCount: raw.reviewCount ?? raw.ReviewCount,
    tag: raw.tag ?? raw.Tag,
    gallery: raw.gallery ?? raw.Gallery ?? [],
    adminMeta: raw.adminMeta ?? raw.AdminMeta,
  };
}

function indexById(list) {
  return Object.fromEntries(list.map((d) => [d.id, d]));
}

const initial = indexById(FALLBACK_DESTINATIONS);

export const useCatalogStore = create((set, get) => ({
  destinations: FALLBACK_DESTINATIONS,
  destinationById: initial,
  loaded: false,
  loading: false,

  hydrate: async (force = false) => {
    if (!force && (get().loading || get().loaded)) return;
    set({ loading: true });
    try {
      const list = await destinationsApi.listDestinations();
      if (Array.isArray(list) && list.length > 0) {
        const destinations = list.map(normalizeDestination);
        set({
          destinations,
          destinationById: indexById(destinations),
          loaded: true,
          loading: false,
        });
        return;
      }
    } catch {
      /* API unavailable — keep embedded fallback */
    }
    set({ loaded: true, loading: false });
  },
}));

export function getCatalogDestinations() {
  return useCatalogStore.getState().destinations;
}

export function getDestinationById(id) {
  return useCatalogStore.getState().destinationById[id];
}

export function getPopularDestinations(limit = 10) {
  return getCatalogDestinations().slice(0, limit);
}
