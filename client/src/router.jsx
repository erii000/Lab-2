import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import MainLayout from "./layouts/MainLayout.jsx";
import RootLayout from "./layouts/RootLayout.jsx";
import AiAssistantPage from "./pages/AiAssistantPage.jsx";
import BookingDetailsPage from "./pages/BookingDetailsPage.jsx";
import BookingTravelerPage from "./pages/BookingTravelerPage.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import BookingSuccessPage from "./pages/BookingSuccessPage.jsx";
import BookingsDashboardPage from "./pages/BookingsDashboardPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import DestinationDetailPage from "./pages/DestinationDetailPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import ItineraryPlannerPage from "./pages/ItineraryPlannerPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import LegacySearchRedirect from "./components/routing/LegacySearchRedirect.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage.jsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage.jsx";
import AdminTripsPage from "./pages/admin/AdminTripsPage.jsx";
import AdminReportsPage from "./pages/admin/AdminReportsPage.jsx";
import AdminUsersPage from "./pages/admin/AdminUsersPage.jsx";

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
          { path: "notifications", element: <Navigate to="/" replace /> },
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
          { path: "admin/users", element: <AdminUsersPage /> },
          { path: "admin/reports", element: <AdminReportsPage /> },
          { path: "admin/settings", element: <AdminSettingsPage /> },
          { path: "admin/roles", element: <Navigate to="/admin/settings" replace /> },
          { path: "admin/permissions", element: <Navigate to="/admin/settings" replace /> },
          { path: "admin/audit-logs", element: <Navigate to="/admin" replace /> },
          { path: "admin/content", element: <Navigate to="/admin" replace /> },
          { path: "admin/recommendations", element: <Navigate to="/admin" replace /> },
          { path: "admin/import-results", element: <Navigate to="/admin" replace /> },
        ],
      },
      { path: "*", element: <Navigate to="/404" replace /> },
    ],
  },
]);
