import { Box } from "@mui/material";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import Footer from "../components/layout/Footer.jsx";
import Navbar from "../components/layout/Navbar.jsx";

const API_STATUS_URL = "http://localhost:5161/api/status";

export default function MainLayout() {
  const [apiStatus, setApiStatus] = useState(null);

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    fetch(API_STATUS_URL, { signal: controller.signal })
      .then((response) => response.json())
      .then((data) => {
        if (mounted) setApiStatus(data);
      })
      .catch(() => {
        if (mounted) setApiStatus(null);
      });

    return () => {
      mounted = false;
      controller.abort();
    };
  }, []);
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
