import {
  DashboardRounded,
  ExploreRounded,
  MenuIcon,
  SmartTravelLogo,
  ViewListRounded,
} from "../ui/icons.jsx";
import {
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import ImportExportRoundedIcon from "@mui/icons-material/ImportExportRounded";
import PeopleOutlineRoundedIcon from "@mui/icons-material/PeopleOutlineRounded";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { adminColors } from "../components/admin/adminStyles.js";
import { designTokens } from "../theme/theme.js";
import { useAuthStore } from "../store/authStore.js";
import { useAdminBookingsStore } from "../store/adminBookingsStore.js";
import { useAdminTripsStore } from "../store/adminTripsStore.js";
import { useAdminUsersStore } from "../store/adminUsersStore.js";
import { useCatalogStore } from "../store/catalogStore.js";
import { useAdminRealtimeRefresh } from "../hooks/useAdminRealtimeRefresh.js";
import { useNotifications } from "../context/NotificationsContext.jsx";

const drawerWidth = 248;

const menuItems = [
  { label: "Dashboard", icon: DashboardRounded, path: "/admin" },
  { label: "Trips", icon: ExploreRounded, path: "/admin/trips" },
  { label: "Bookings", icon: ViewListRounded, path: "/admin/bookings" },
  { label: "Users", icon: PeopleOutlineRoundedIcon, path: "/admin/users" },
  { label: "Reports", icon: AssessmentRoundedIcon, path: "/admin/reports" },
  { label: "Data exchange", icon: ImportExportRoundedIcon, path: "/admin/data" },
  { label: "Settings", icon: SettingsOutlinedIcon, path: "/admin/settings" },
];

function NavList({ onNavigate }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <List sx={{ px: 1.5, py: 2, flex: 1 }}>
      {menuItems.map((item) => {
        const active =
          item.path === "/admin"
            ? location.pathname === "/admin"
            : location.pathname.startsWith(item.path);
        const Icon = item.icon;
        return (
          <ListItemButton
            key={item.path}
            onClick={() => {
              navigate(item.path);
              onNavigate?.();
            }}
            sx={{
              mb: 0.5,
              borderRadius: 2.5,
              py: 1.15,
              transition: "background 0.2s ease",
              bgcolor: active ? alpha(designTokens.brand.gold, 0.12) : "transparent",
              border: `1px solid ${active ? alpha(designTokens.brand.gold, 0.3) : "transparent"}`,
              "&:hover": { bgcolor: alpha(designTokens.brand.gold, 0.07) },
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: active ? adminColors.gold : alpha("#fff", 0.5) }}>
              <Icon fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{
                fontSize: 14,
                fontWeight: active ? 700 : 500,
                color: active ? "#fff" : alpha("#fff", 0.72),
              }}
            />
          </ListItemButton>
        );
      })}
    </List>
  );
}

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const session = useAuthStore((s) => s.session);
  const isAdmin = session?.role === "admin";
  const { connected: liveConnected } = useNotifications();
  useAdminRealtimeRefresh();

  useEffect(() => {
    if (!session?.accessToken || !isAdmin) return;
    (async () => {
      await useCatalogStore.getState().hydrate();
      const token = session.accessToken;
      useAdminBookingsStore.getState().hydrateFromApi(token);
      useAdminTripsStore.getState().hydrateFromApi(token);
      useAdminUsersStore.getState().hydrateFromApi(token);
    })();
  }, [session?.accessToken, isAdmin]);

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const sidebar = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ px: 2.5, py: 2.5 }}>
        <Stack
          component={RouterLink}
          to="/"
          direction="row"
          spacing={1.25}
          alignItems="center"
          sx={{
            textDecoration: "none",
            color: "#fff",
            "&:hover .MuiTypography-root": { color: adminColors.gold },
          }}
        >
          <SmartTravelLogo sx={{ fontSize: 28 }} />
          <Typography variant="subtitle1" fontWeight={800} sx={{ letterSpacing: "-0.02em" }}>
            Smart Travel
          </Typography>
          {liveConnected ? (
            <Typography
              variant="caption"
              sx={{
                ml: "auto",
                px: 1,
                py: 0.25,
                borderRadius: 1,
                bgcolor: alpha("#4caf50", 0.2),
                color: "#81c784",
                fontWeight: 700,
              }}
            >
              LIVE
            </Typography>
          ) : null}
        </Stack>
      </Box>
      <NavList onNavigate={() => setMobileOpen(false)} />
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: adminColors.bg }}>
      <CssBaseline />

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", md: "block" },
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: adminColors.surface,
            borderRight: `1px solid ${adminColors.border}`,
          },
        }}
        open
      >
        {sidebar}
      </Drawer>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { md: "none" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            bgcolor: adminColors.surface,
            borderRight: `1px solid ${adminColors.border}`,
          },
        }}
      >
        {sidebar}
      </Drawer>

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Toolbar
          sx={{
            display: { md: "none" },
            borderBottom: `1px solid ${adminColors.border}`,
            minHeight: 56,
          }}
        >
          <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)}>
            <MenuIcon />
          </IconButton>
        </Toolbar>

        <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 3.5 }, overflow: "auto" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
