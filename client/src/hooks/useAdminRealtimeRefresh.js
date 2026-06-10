import { useEffect } from "react";
import { subscribeTravelUpdate } from "../services/travelUpdateBus.js";
import { useAuthStore } from "../store/authStore.js";
import { useAdminBookingsStore } from "../store/adminBookingsStore.js";
import { useAdminTripsStore } from "../store/adminTripsStore.js";
import { useAdminUsersStore } from "../store/adminUsersStore.js";
/**
 * Refreshes admin data stores when SignalR pushes a travelUpdate (event-driven, not polling).
 * Notifications are pushed live by AdminNotificationsProvider — not refetched here.
 */
export function useAdminRealtimeRefresh() {
  const session = useAuthStore((s) => s.session);

  useEffect(() => {
    if (session?.role !== "admin" || !session?.accessToken) return undefined;

    return subscribeTravelUpdate(async () => {
      const token = await useAuthStore.getState().ensureAccessToken();
      if (!token) return;

      await Promise.all([
        useAdminBookingsStore.getState().hydrateFromApi(token),
        useAdminTripsStore.getState().hydrateFromApi(token),
        useAdminUsersStore.getState().hydrateFromApi(token),
      ]);
    });
  }, [session?.role, session?.accessToken]);
}
