import UsersManagementPage from "./pages/UsersManagementPage.jsx";
import RolesManagementPage from "./pages/RolesManagementPage.jsx";
import PermissionsManagementPage from "./pages/PermissionsManagementPage.jsx";
import AuditLogsPage from "./pages/AuditLogsPage.jsx";
import RecommendationsPage from "./pages/RecommendationsPage.jsx";
import ImportResultsPage from "./pages/ImportResultsPage.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx"; import { CssBaseline, ThemeProvider } from "@mui/material";
import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import { LoadingProvider, useLoading } from "./context/LoadingContext.jsx";
import { NotificationsProvider } from "./context/NotificationsContext.jsx";
import { ToastProvider } from "./context/ToastContext.jsx";
import AboutHelpPage from "./pages/AboutHelpPage.jsx";
import AiAssistantPage from "./pages/AiAssistantPage.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import DestinationDetailPage from "./pages/DestinationDetailPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import ItineraryPlannerPage from "./pages/ItineraryPlannerPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import NotificationsPage from "./pages/NotificationsPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import { appTheme } from "./theme/theme.js";

const API_STATUS_URL = "http://localhost:5161/api/status";

function AppRoutes() {
  const [apiStatus, setApiStatus] = useState(null);
  const { runWithLoader } = useLoading();

  useEffect(() => {
    let mounted = true;
    runWithLoader(async () => {
      try {
        const response = await fetch(API_STATUS_URL);
        const data = await response.json();
        if (mounted) {
          setApiStatus(data);
        }
      } catch {
        if (mounted) {
          setApiStatus(null);
        }
      }
    });
    return () => {
      mounted = false;
    };
  }, [runWithLoader]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout apiStatus={apiStatus} />}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="destination/:id" element={<DestinationDetailPage />} />
          <Route path="itinerary" element={<ItineraryPlannerPage />} />
          <Route path="booking" element={<BookingPage />} />
          <Route path="assistant" element={<AiAssistantPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="about" element={<AboutHelpPage />} />
          <Route path="404" element={<NotFoundPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
              </Route>
              <Route element={<AdminLayout />}>
                  <Route path="admin" element={<AdminDashboardPage />} />
                  <Route path="admin/users" element={<UsersManagementPage />} />
                  <Route path="admin/roles" element={<RolesManagementPage />} />
                  <Route path="admin/permissions" element={<PermissionsManagementPage />} />
                  <Route path="admin/audit-logs" element={<AuditLogsPage />} />
                  <Route path="admin/recommendations" element={<RecommendationsPage />} />
                  <Route path="admin/import-results" element={<ImportResultsPage />} />
              </Route>

        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <ToastProvider>
        <LoadingProvider>
          <NotificationsProvider>
            <AppRoutes />
          </NotificationsProvider>
        </LoadingProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
