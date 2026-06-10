import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import MainLayout from "./layouts/MainLayout.jsx";
import RootLayout from "./layouts/RootLayout.jsx";
import LegacySearchRedirect from "./components/routing/LegacySearchRedirect.jsx";

const HomePage = lazy(() => import("./pages/HomePage.jsx"));
const SearchPage = lazy(() => import("./pages/SearchPage.jsx"));
const DestinationDetailPage = lazy(() => import("./pages/DestinationDetailPage.jsx"));
const ItineraryPlannerPage = lazy(() => import("./pages/ItineraryPlannerPage.jsx"));
const BookingPage = lazy(() => import("./pages/BookingPage.jsx"));
const BookingsDashboardPage = lazy(() => import("./pages/BookingsDashboardPage.jsx"));
const BookingDetailsPage = lazy(() => import("./pages/BookingDetailsPage.jsx"));
const BookingTravelerPage = lazy(() => import("./pages/BookingTravelerPage.jsx"));
const BookingSuccessPage = lazy(() => import("./pages/BookingSuccessPage.jsx"));
const ContactPage = lazy(() => import("./pages/ContactPage.jsx"));
const AiAssistantPage = lazy(() => import("./pages/AiAssistantPage.jsx"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage.jsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.jsx"));
const RegisterPage = lazy(() => import("./pages/RegisterPage.jsx"));
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage.jsx"));
const AdminTripsPage = lazy(() => import("./pages/admin/AdminTripsPage.jsx"));
const AdminBookingsPage = lazy(() => import("./pages/admin/AdminBookingsPage.jsx"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage.jsx"));
const AdminReportsPage = lazy(() => import("./pages/admin/AdminReportsPage.jsx"));
const AdminDataExchangePage = lazy(() => import("./pages/admin/AdminDataExchangePage.jsx"));
const AdminSettingsPage = lazy(() => import("./pages/admin/AdminSettingsPage.jsx"));
const AdminMessagesPage = lazy(() => import("./pages/admin/AdminMessagesPage.jsx"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage.jsx"));

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <HomePage /> },
          { path: "explore", element: <SearchPage /> },
          { path: "search", element: <LegacySearchRedirect /> },
          { path: "destination/:id", element: <DestinationDetailPage /> },
          { path: "itinerary", element: <ItineraryPlannerPage /> },
          { path: "booking", element: <BookingPage /> },
          { path: "bookings", element: <BookingsDashboardPage /> },
          { path: "bookings/:bookingId", element: <BookingDetailsPage /> },
          { path: "bookings/:bookingId/traveler", element: <BookingTravelerPage /> },
          { path: "bookings/:bookingId/success", element: <BookingSuccessPage /> },
          { path: "checkout", element: <Navigate to="/bookings" replace /> },
          { path: "contact", element: <ContactPage /> },
          { path: "profile", element: <Navigate to="/contact" replace /> },
          { path: "notifications", element: <NotificationsPage /> },
          { path: "about", element: <Navigate to="/contact" replace /> },
          { path: "assistant", element: <AiAssistantPage /> },
          { path: "404", element: <NotFoundPage /> },
        ],
      },
      {
        element: <AuthLayout />,
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "register", element: <RegisterPage /> },
        ],
      },
      {
        element: <AdminLayout />,
        children: [
          { path: "admin", element: <AdminDashboardPage /> },
          { path: "admin/trips", element: <AdminTripsPage /> },
          { path: "admin/trips/:tripId", element: <Navigate to="/admin/trips" replace /> },
          { path: "admin/bookings", element: <AdminBookingsPage /> },
          { path: "admin/messages", element: <AdminMessagesPage /> },
          { path: "admin/users", element: <AdminUsersPage /> },
          { path: "admin/reports", element: <AdminReportsPage /> },
          { path: "admin/data", element: <AdminDataExchangePage /> },
          { path: "admin/import-results", element: <Navigate to="/admin/data" replace /> },
          { path: "admin/settings", element: <AdminSettingsPage /> },
          { path: "admin/roles", element: <Navigate to="/admin/settings" replace /> },
          { path: "admin/permissions", element: <Navigate to="/admin/settings" replace /> },
          { path: "admin/audit-logs", element: <Navigate to="/admin" replace /> },
          { path: "admin/content", element: <Navigate to="/admin" replace /> },
          { path: "admin/recommendations", element: <Navigate to="/admin" replace /> },
        ],
      },
      { path: "*", element: <Navigate to="/404" replace /> },
    ],
  },
]);
