/**
 * Destination catalog — loaded from API when available, with embedded fallback offline.
 */
export {
  useCatalogStore,
  getCatalogDestinations,
  getDestinationById,
  getPopularDestinations,
} from "../store/catalogStore.js";

import {
  getCatalogDestinations,
  getDestinationById,
  getPopularDestinations,
} from "../store/catalogStore.js";

/** @deprecated Prefer getCatalogDestinations() — returns current catalog snapshot */
export const destinations = getCatalogDestinations();

/** @deprecated Prefer getDestinationById(id) */
export const destinationById = new Proxy(
  {},
  {
    get(_, prop) {
      return getDestinationById(String(prop));
    },
  },
);

/** @deprecated Prefer getPopularDestinations() */
export const popularDestinations = getPopularDestinations();
