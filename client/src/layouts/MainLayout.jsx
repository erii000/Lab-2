import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Footer from "../components/layout/Footer.jsx";
import Navbar from "../components/layout/Navbar.jsx";
import { useLoading } from "../context/LoadingContext.jsx";

const API_STATUS_URL = "http://localhost:5161/api/status";

export default function MainLayout() {
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
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Navbar />
      <Box component="main" sx={{ flex: 1, width: "100%" }}>
        <Outlet />
      </Box>
      <Footer apiStatus={apiStatus} />
    </Box>
  );
}
