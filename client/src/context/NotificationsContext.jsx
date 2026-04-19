import { createContext, useContext, useMemo, useState } from "react";

const initialNotifications = [
  {
    id: "n-1001",
    title: "Your itinerary is ready",
    body: "AI has generated your 5-day Rome plan with flights, stays, and dining recommendations.",
    timestamp: "Today, 09:12",
    category: "Itinerary",
    unread: true,
  },
  {
    id: "n-1002",
    title: "Price drop detected",
    body: "Return flights to Tokyo dropped by 14% compared to yesterday. Great time to book.",
    timestamp: "Today, 07:45",
    category: "Deals",
    unread: true,
  },
  {
    id: "n-1003",
    title: "Booking confirmed",
    body: "Your boutique hotel reservation in Barcelona was successfully confirmed.",
    timestamp: "Yesterday, 18:30",
    category: "Booking",
    unread: false,
  },
  {
    id: "n-1004",
    title: "Weather advisory",
    body: "Light rain expected in Paris during your trip dates. Consider indoor alternatives on day 3.",
    timestamp: "Yesterday, 11:08",
    category: "Weather",
    unread: false,
  },
  {
    id: "n-1005",
    title: "Document reminder",
    body: "Your passport expires in 5 months. Some destinations require 6+ months validity.",
    timestamp: "Apr 15, 16:42",
    category: "Reminder",
    unread: false,
  },
  {
    id: "n-1006",
    title: "Trip collaboration update",
    body: "Mariam added two activities to your Dubai itinerary: desert safari and marina dinner.",
    timestamp: "Apr 12, 13:27",
    category: "Collaboration",
    unread: false,
  },
];

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const [notifications, setNotifications] = useState(initialNotifications);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => notification.unread).length,
    [notifications],
  );

  const markAsRead = (notificationId) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, unread: false }
          : notification,
      ),
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, unread: false })),
    );
  };

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
    }),
    [notifications, unreadCount],
  );

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationsProvider.");
  }
  return context;
}
