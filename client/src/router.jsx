import { createBrowserRouter, Navigate } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import MainLayout from "./layouts/MainLayout.jsx";
import RootLayout from "./layouts/RootLayout.jsx";
import AboutHelpPage from "./pages/AboutHelpPage.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import AiAssistantPage from "./pages/AiAssistantPage.jsx";
import AuditLogsPage from "./pages/AuditLogsPage.jsx";
import BookingDetailsPage from "./pages/BookingDetailsPage.jsx";
import BookingTravelerPage from "./pages/BookingTravelerPage.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import BookingSuccessPage from "./pages/BookingSuccessPage.jsx";
import BookingsDashboardPage from "./pages/BookingsDashboardPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import DestinationDetailPage from "./pages/DestinationDetailPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import ImportResultsPage from "./pages/ImportResultsPage.jsx";
import ItineraryPlannerPage from "./pages/ItineraryPlannerPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import PermissionsManagementPage from "./pages/PermissionsManagementPage.jsx";
import RecommendationsPage from "./pages/RecommendationsPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import RolesManagementPage from "./pages/RolesManagementPage.jsx";
import LegacySearchRedirect from "./components/routing/LegacySearchRedirect.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import UsersManagementPage from "./pages/UsersManagementPage.jsx";

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
          { path: "assistant", element: <AiAssistantPage /> },
          { path: "notifications", element: <Navigate to="/" replace /> },
          { path: "about", element: <AboutHelpPage /> },
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
          { path: "admin/users", element: <UsersManagementPage /> },
          { path: "admin/roles", element: <RolesManagementPage /> },
          { path: "admin/permissions", element: <PermissionsManagementPage /> },
          { path: "admin/audit-logs", element: <AuditLogsPage /> },
          { path: "admin/recommendations", element: <RecommendationsPage /> },
          { path: "admin/import-results", element: <ImportResultsPage /> },
        ],
      },
      { path: "*", element: <Navigate to="/404" replace /> },
    ],
  },
]);
