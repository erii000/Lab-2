/** @deprecated Import from `destinations.js` — kept for backward-compatible imports. */
import { getCatalogDestinations, getPopularDestinations } from "./destinations.js";
import { getDestinationDetail, searchDestinations } from "../utils/destinationSearch.js";

export const mockTrending = getPopularDestinations(3);
export const mockSearchResults = getCatalogDestinations();

export { getDestinationDetail, searchDestinations };
