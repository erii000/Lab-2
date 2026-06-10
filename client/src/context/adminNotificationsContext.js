import { createContext, useContext } from "react";

export const AdminNotificationsContext = createContext({
  connected: false,
});

export function useAdminNotificationsLive() {
  return useContext(AdminNotificationsContext);
}
