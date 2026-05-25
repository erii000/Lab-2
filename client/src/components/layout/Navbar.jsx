import { BrandMonogramLogo, DashboardRounded, MenuIcon } from "../../ui/icons.jsx";
import {
  AppBar,
  Avatar,
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
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useMemo, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore.js";
import { useBookingStore } from "../../store/bookingStore.js";

function AdminDashboardIcon({ onNavigate, sx }) {
  const isAdmin = useAuthStore((s) => s.session?.role === "admin");
  if (!isAdmin) return null;

  return (
    <Tooltip title="Admin dashboard">
      <IconButton
        component={RouterLink}
        to="/admin"
        onClick={onNavigate}
        color="inherit"
        aria-label="Admin dashboard"
        sx={{
          border: `1px solid ${alpha("#d4af6a", 0.35)}`,
          bgcolor: alpha("#d4af6a", 0.08),
          "&:hover": { bgcolor: alpha("#d4af6a", 0.16) },
          ...sx,
        }}
      >
        <DashboardRounded fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}

const navLinks = [
  { label: "Home", to: "/", description: "Landing & quick search" },
  { label: "Explore", to: "/explore", description: "Destinations & filters" },
  { label: "Assistant", to: "/assistant", description: "AI trip planning" },
  { label: "Bookings", to: "/bookings", description: "Travel dashboard", badge: "bookings" },
  { label: "Contact", to: "/contact", description: "Support & inquiries" },
];

function displayNameFromSession(session) {
  if (!session) return "User";
  const stored = session.name?.trim();
  if (!stored) return session.email?.split("@")[0] || "User";
  const words = stored.split(/\s+/).filter(Boolean);
  return words.filter((word, i) => i === 0 || word.toLowerCase() !== words[i - 1].toLowerCase()).join(" ");
}

function initialsFromName(name) {
  return (
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  );
}

function NavbarGuestButtons({ theme, onNavigate, fullWidth = false }) {
  const buttonSx = fullWidth ? { width: "100%" } : undefined;

  return (
    <>
      <Button
        variant="outlined"
        component={RouterLink}
        to="/login"
        onClick={onNavigate}
        sx={{
          ...buttonSx,
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
        onClick={onNavigate}
        sx={{
          ...buttonSx,
          bgcolor: "primary.main",
          color: "#111318",
          fontWeight: 700,
          "&:hover": { bgcolor: "primary.light" },
        }}
      >
        Get started
      </Button>
    </>
  );
}

function NavbarUserMenu({ theme, onNavigate, showWelcome = true, fullWidth = false }) {
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(null);

  if (!session) return null;

  const displayName = displayNameFromSession(session);
  const initials = initialsFromName(displayName);

  const handleLogout = () => {
    logout();
    setAnchor(null);
    onNavigate?.();
    navigate("/");
  };

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{ width: fullWidth ? "100%" : "auto", justifyContent: fullWidth ? "flex-start" : "flex-end" }}
    >
      {showWelcome && (
        <Typography
          variant="body2"
          sx={{
            display: fullWidth ? "block" : { xs: "none", sm: "block" },
            color: alpha("#fff", 0.88),
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          Welcome, {displayName}
        </Typography>
      )}
      <Tooltip title="Account">
        <IconButton
          onClick={(e) => setAnchor(e.currentTarget)}
          aria-label="Account menu"
          sx={{
            p: 0.25,
            ml: fullWidth ? "auto" : 0,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.4)}`,
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: alpha(theme.palette.primary.main, 0.18),
              color: theme.palette.primary.main,
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            {initials}
          </Avatar>
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={() => setAnchor(null)}>
        <MenuItem disabled sx={{ opacity: "1 !important" }}>
          <Box>
            <Typography variant="body2" fontWeight={700}>
              {displayName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {session.email}
            </Typography>
          </Box>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleLogout();
          }}
        >
          Sign out
        </MenuItem>
      </Menu>
    </Stack>
  );
}

function NavbarAuthControls({ theme, onNavigate, showWelcome = true, fullWidth = false }) {
  const session = useAuthStore((s) => s.session);

  if (session) {
    return <NavbarUserMenu theme={theme} onNavigate={onNavigate} showWelcome={showWelcome} fullWidth={fullWidth} />;
  }

  return <NavbarGuestButtons theme={theme} onNavigate={onNavigate} fullWidth={fullWidth} />;
}

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
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
            <AdminDashboardIcon onNavigate={() => setMobileOpen(false)} />
          </Stack>
          <NavbarAuthControls
            theme={theme}
            onNavigate={() => setMobileOpen(false)}
            showWelcome
            fullWidth
          />
        </Stack>
      </Box>
    ),
    [location.pathname, theme],
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
              <AdminDashboardIcon sx={{ display: { xs: "none", md: "inline-flex" } }} />
              {isMdUp && <NavbarAuthControls theme={theme} showWelcome />}
              {!isMdUp && (
                <>
                  <AdminDashboardIcon />
                  <IconButton color="inherit" edge="end" onClick={() => setMobileOpen(true)}>
                    <MenuIcon />
                  </IconButton>
                </>
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
