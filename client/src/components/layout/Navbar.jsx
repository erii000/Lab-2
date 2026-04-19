import { BrandMonogramLogo, MenuIcon, NotificationsOutlined } from "../../ui/icons.jsx";
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useMemo, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";

const navLinks = [
  { label: "Home", to: "/", description: "Landing & quick search" },
  { label: "Explore", to: "/search", description: "Destinations & filters" },
  { label: "Assistant", to: "/assistant", description: "AI trip planning" },
  { label: "Itinerary", to: "/itinerary", description: "Day-by-day planner" },
  { label: "Booking", to: "/booking", description: "Flights, stays, activities" },
  { label: "About", to: "/about", description: "Help & FAQ" },
];

export default function Navbar() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const drawer = useMemo(
    () => (
      <Box sx={{ width: 280, pt: 2 }} role="presentation">
        <Typography variant="subtitle2" color="text.secondary" sx={{ px: 2, pb: 1 }}>
          Navigate
        </Typography>
        <Divider />
        <List>
          {navLinks.map((item) => (
            <ListItemButton
              key={item.to}
              component={RouterLink}
              to={item.to}
              selected={location.pathname === item.to}
              onClick={() => setMobileOpen(false)}
            >
              <ListItemText primary={item.label} secondary={item.description} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    ),
    [location.pathname],
  );

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: alpha("#090c12", 0.88),
          backdropFilter: "blur(14px)",
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
          boxShadow: "0 10px 34px rgba(0,0,0,0.38)",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 62, md: 72 }, gap: 2 }}>
            <Stack
              direction="row"
              spacing={1.25}
              alignItems="center"
              component={RouterLink}
              to="/"
              sx={{ textDecoration: "none", minWidth: { md: 260 } }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.2,
                  display: "grid",
                  placeItems: "center",
                  background:
                    "radial-gradient(circle at 25% 20%, rgba(248,213,138,0.2), rgba(212,175,106,0.06) 58%, rgba(0,0,0,0) 100%)",
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.55)}`,
                  boxShadow: "0 0 0 3px rgba(212,175,106,0.12), 0 10px 26px rgba(0,0,0,0.35)",
                }}
              >
                <BrandMonogramLogo sx={{ fontSize: 30 }} />
              </Box>
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 800, letterSpacing: "-0.02em", color: "common.white", lineHeight: 1.1 }}
                >
                  Smart Travel Assistant
                </Typography>
                <Typography variant="caption" sx={{ color: alpha("#fff", 0.65), letterSpacing: "0.08em" }}>
                  LUXURY PLANNING PLATFORM
                </Typography>
              </Box>
            </Stack>

            {isMdUp ? (
              <Stack direction="row" spacing={0.75} sx={{ flex: 1, justifyContent: "center" }}>
                {navLinks.map((item) => {
                  const active = location.pathname === item.to;
                  return (
                    <Button
                      key={item.to}
                      component={RouterLink}
                      to={item.to}
                      color="inherit"
                      sx={{
                        px: 1.5,
                        py: 0.8,
                        borderRadius: 2,
                        color: active ? "primary.main" : alpha("#fff", 0.85),
                        bgcolor: active ? alpha(theme.palette.primary.main, 0.13) : "transparent",
                        border: `1px solid ${active ? alpha(theme.palette.primary.main, 0.45) : "transparent"}`,
                        "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.16) },
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Stack>
            ) : (
              <Box sx={{ flexGrow: 1 }} />
            )}

            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton
                color="inherit"
                component={RouterLink}
                to="/notifications"
                aria-label="Notifications"
                sx={{
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.34)}`,
                  color: location.pathname === "/notifications" ? "primary.main" : alpha("#fff", 0.9),
                  bgcolor: location.pathname === "/notifications" ? alpha(theme.palette.primary.main, 0.12) : "transparent",
                  "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.16) },
                }}
              >
                <NotificationsOutlined />
              </IconButton>
              <Button
                variant="outlined"
                color="inherit"
                component={RouterLink}
                to="/login"
                sx={{
                  borderColor: alpha(theme.palette.primary.main, 0.45),
                  color: alpha("#fff", 0.92),
                  "&:hover": { borderColor: theme.palette.primary.main, bgcolor: alpha(theme.palette.primary.main, 0.12) },
                }}
              >
                Log in
              </Button>
              <Button
                variant="contained"
                component={RouterLink}
                to="/register"
                sx={{
                  bgcolor: "primary.main",
                  color: "#111318",
                  fontWeight: 700,
                  "&:hover": { bgcolor: "primary.light" },
                }}
              >
                Get started
              </Button>
              {!isMdUp && (
                <IconButton color="inherit" edge="end" onClick={() => setMobileOpen(true)}>
                  <MenuIcon />
                </IconButton>
              )}
            </Stack>
          </Toolbar>
        </Container>

        <Drawer anchor="right" open={mobileOpen} onClose={() => setMobileOpen(false)}>
          {drawer}
        </Drawer>
      </AppBar>
    </>
  );
}
