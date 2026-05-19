/** @deprecated Import from `destinations.js` — kept for backward-compatible imports. */
import { destinations, popularDestinations } from "./destinations.js";
import { getDestinationDetail, searchDestinations } from "../utils/destinationSearch.js";

export const mockTrending = popularDestinations.slice(0, 3);
export const mockSearchResults = destinations;

export { getDestinationDetail, searchDestinations };
