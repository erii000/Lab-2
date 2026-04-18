import { CssBaseline, ThemeProvider } from "@mui/material";
import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.jsx";
import AuthLayout from "./layouts/AuthLayout.jsx";
import AboutHelpPage from "./pages/AboutHelpPage.jsx";
import AiAssistantPage from "./pages/AiAssistantPage.jsx";
import BookingPage from "./pages/BookingPage.jsx";
import DestinationDetailPage from "./pages/DestinationDetailPage.jsx";
import HomePage from "./pages/HomePage.jsx";
import ItineraryPlannerPage from "./pages/ItineraryPlannerPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
import { appTheme } from "./theme/theme.js";

const API_STATUS_URL = "http://localhost:5161/api/status";

function App() {
  const [apiStatus, setApiStatus] = useState(null);

  useEffect(() => {
    fetch(API_STATUS_URL)
      .then((res) => res.json())
      .then((data) => setApiStatus(data))
      .catch(() => setApiStatus(null));
  }, []);

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout apiStatus={apiStatus} />}>
            <Route index element={<HomePage />} />
            <Route path="search" element={<SearchPage />} />
            <Route path="destination/:id" element={<DestinationDetailPage />} />
            <Route path="itinerary" element={<ItineraryPlannerPage />} />
            <Route path="booking" element={<BookingPage />} />
            <Route path="assistant" element={<AiAssistantPage />} />
            <Route path="about" element={<AboutHelpPage />} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
