import { BrandMonogramLogo, MenuIcon } from "../../ui/icons.jsx";
import {
  AppBar,
  Badge,
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
import { useBookingStore } from "../../store/bookingStore.js";

const navLinks = [
  { label: "Home", to: "/", description: "Landing & quick search" },
  { label: "Explore", to: "/explore", description: "Destinations & filters" },
  { label: "Assistant", to: "/assistant", description: "AI trip planning" },
  { label: "Bookings", to: "/bookings", description: "Travel dashboard", badge: "bookings" },
  { label: "Contact", to: "/contact", description: "Support & inquiries" },
];

export default function Navbar() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const draftCount = useBookingStore((s) => s.getDraftCount());

  const drawer = useMemo(
    () => (
      <Box sx={{ width: { xs: "min(86vw, 320px)", sm: 320 }, pt: 2 }} role="presentation">
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
        <Divider sx={{ mt: 0.5 }} />
        <Stack spacing={1.1} sx={{ p: 2 }}>
          <Button
            variant="outlined"
            component={RouterLink}
            to="/login"
            onClick={() => setMobileOpen(false)}
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
            onClick={() => setMobileOpen(false)}
            sx={{
              bgcolor: "primary.main",
              color: "#111318",
              fontWeight: 700,
              "&:hover": { bgcolor: "primary.light" },
            }}
          >
            Get started
          </Button>
        </Stack>
      </Box>
    ),
    [location.pathname, theme.palette.primary.main],
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
          <Toolbar disableGutters sx={{ minHeight: { xs: 62, md: 72 }, gap: { xs: 1, md: 2 } }}>
            <Stack
              direction="row"
              spacing={1.25}
              alignItems="center"
              component={RouterLink}
              to="/"
              sx={{ textDecoration: "none", minWidth: { xs: 0, md: 260 }, flexShrink: 1 }}
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
              <Box sx={{ display: { xs: "none", sm: "block" } }}>
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
                  const active =
                    item.to === "/bookings"
                      ? location.pathname.startsWith("/bookings")
                      : item.to === "/explore"
                        ? location.pathname.startsWith("/explore")
                        : location.pathname === item.to;
                  const showDraftBadge = item.badge === "bookings" && draftCount > 0;
                  return (
                    <Badge
                      key={item.to}
                      badgeContent={showDraftBadge ? draftCount : 0}
                      color="secondary"
                      invisible={!showDraftBadge}
                      sx={{ "& .MuiBadge-badge": { fontWeight: 700, fontSize: "0.65rem" } }}
                    >
                      <Button
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
                    </Badge>
                  );
                })}
              </Stack>
            ) : (
              <Box sx={{ flexGrow: 1 }} />
            )}

            <Stack direction="row" spacing={0.6} alignItems="center" sx={{ flexShrink: 0 }}>
              {isMdUp && (
                <>
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
                </>
              )}
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
