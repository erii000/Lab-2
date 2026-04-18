import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import Footer from "../components/layout/Footer.jsx";
import Navbar from "../components/layout/Navbar.jsx";

export default function MainLayout({ apiStatus }) {
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
