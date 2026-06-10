import { useAdminBookingsStore } from "../store/adminBookingsStore.js";
import { useAdminTripsStore } from "../store/adminTripsStore.js";
import { useAdminUsersStore } from "../store/adminUsersStore.js";

/** True once admin bookings, trips, and users have finished their initial API hydrate. */
export function useAdminStoresReady() {
  const bookingsLoaded = useAdminBookingsStore((s) => s.loadedFromApi);
  const tripsLoaded = useAdminTripsStore((s) => s.loadedFromApi);
  const usersLoaded = useAdminUsersStore((s) => s.loadedFromApi);
  return bookingsLoaded && tripsLoaded && usersLoaded;
}
