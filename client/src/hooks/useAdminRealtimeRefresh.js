import { useEffect } from "react";
import { subscribeTravelUpdate } from "../services/travelUpdateBus.js";
import { useAuthStore } from "../store/authStore.js";
import { useAdminBookingsStore } from "../store/adminBookingsStore.js";
import { useAdminTripsStore } from "../store/adminTripsStore.js";
import { useAdminUsersStore } from "../store/adminUsersStore.js";
import { useAdminNotificationsStore } from "../store/adminNotificationsStore.js";
/**
 * Keeps admin stores in sync when the server pushes SignalR travel updates.
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
        useAdminNotificationsStore.getState().hydrateFromApi(token),
      ]);
    });
  }, [session?.role, session?.accessToken]);
}
