import { BrandMonogramLogo, MenuIcon, NotificationsOutlined } from "../../ui/icons.jsx";
import {
  AppBar,
  Badge,
  Box,
  Button,
  Chip,
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
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useMemo, useState } from "react";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationsContext.jsx";

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
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const notificationsOpen = Boolean(notificationAnchorEl);
  const previewNotifications = useMemo(
    () => notifications.slice(0, 6),
    [notifications],
  );

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

            <Stack direction="row" spacing={0.6} alignItems="center" sx={{ flexShrink: 0 }}>
              <IconButton
                color="inherit"
                aria-label="Notifications"
                onClick={(event) => setNotificationAnchorEl(event.currentTarget)}
                sx={{
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.34)}`,
                  color: location.pathname === "/notifications" ? "primary.main" : alpha("#fff", 0.9),
                  bgcolor: location.pathname === "/notifications" ? alpha(theme.palette.primary.main, 0.12) : "transparent",
                  "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.16) },
                }}
              >
                <Badge
                  badgeContent={unreadCount}
                  color="primary"
                  max={99}
                  overlap="circular"
                  sx={{
                    "& .MuiBadge-badge": {
                      fontWeight: 700,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.75)}`,
                      boxShadow: "0 0 0 2px rgba(9, 12, 18, 0.9)",
                    },
                  }}
                >
                  <NotificationsOutlined />
                </Badge>
              </IconButton>
              <Menu
                anchorEl={notificationAnchorEl}
                open={notificationsOpen}
                onClose={() => setNotificationAnchorEl(null)}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                slotProps={{
                  paper: {
                    sx: {
                      mt: 1.2,
                      width: 380,
                      maxWidth: "calc(100vw - 24px)",
                      borderRadius: 2.2,
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                      backgroundColor: alpha("#111827", 0.95),
                      backgroundImage:
                        "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))",
                      backdropFilter: "blur(12px)",
                    },
                  },
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1.8, py: 1.3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    Notifications
                  </Typography>
                  <Chip size="small" label={`${unreadCount} unread`} color="primary" />
                </Stack>
                <Divider sx={{ borderColor: alpha(theme.palette.primary.main, 0.22) }} />
                {previewNotifications.length ? (
                  previewNotifications.map((item) => (
                    <MenuItem
                      key={item.id}
                      onClick={() => {
                        if (item.unread) {
                          markAsRead(item.id);
                        }
                        setNotificationAnchorEl(null);
                        navigate("/notifications");
                      }}
                      sx={{
                        alignItems: "flex-start",
                        gap: 1,
                        py: 1.1,
                        borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
                        whiteSpace: "normal",
                      }}
                    >
                      <Box sx={{ pt: 0.6 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: item.unread ? "primary.main" : alpha(theme.palette.text.secondary, 0.45),
                            boxShadow: item.unread ? `0 0 0 4px ${alpha(theme.palette.primary.main, 0.18)}` : "none",
                          }}
                        />
                      </Box>
                      <Stack spacing={0.45} sx={{ minWidth: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {item.title}
                          </Typography>
                          {item.unread && <Chip label="New" size="small" color="primary" sx={{ height: 20 }} />}
                        </Stack>
                        <Typography variant="caption" sx={{ color: "text.secondary", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {item.body}
                        </Typography>
                        <Typography variant="caption" sx={{ color: alpha(theme.palette.text.secondary, 0.82) }}>
                          {item.timestamp}
                        </Typography>
                      </Stack>
                    </MenuItem>
                  ))
                ) : (
                  <Box sx={{ px: 2, py: 2.5 }}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      No notifications yet.
                    </Typography>
                  </Box>
                )}
                <Divider sx={{ borderColor: alpha(theme.palette.primary.main, 0.2) }} />
                <Box sx={{ p: 1 }}>
                  <Button
                    fullWidth
                    variant="text"
                    onClick={() => {
                      setNotificationAnchorEl(null);
                      navigate("/notifications");
                    }}
                    sx={{
                      color: "primary.main",
                      "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.12) },
                    }}
                  >
                    View all notifications
                  </Button>
                </Box>
              </Menu>
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
