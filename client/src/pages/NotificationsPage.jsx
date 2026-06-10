import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink, Navigate, useNavigate } from "react-router-dom";
import { useNotifications } from "../context/useNotifications.js";
import { useAuthStore } from "../store/authStore.js";
import { designTokens } from "../theme/theme.js";
import { bookingLinkFromNotification } from "../utils/notificationLinks.js";

export default function NotificationsPage() {
  const session = useAuthStore((s) => s.session);
  const navigate = useNavigate();
  const { items, loading, unreadCount, markAllRead, markRead } = useNotifications();

  if (session?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  function openNotification(item) {
    if (!item.read) markRead(item.id);

    const link =
      item.link ??
      bookingLinkFromNotification({
        type: item.type,
        bookingId: item.bookingServerId,
        bookingServerId: item.bookingServerId,
        message: item.message,
      });

    if (link) navigate(link);
  }

  return (
    <Box sx={{ maxWidth: 720, mx: "auto", py: { xs: 3, md: 5 }, px: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Notifications
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {unreadCount > 0 ? `${unreadCount} unread` : "You're all caught up"}
          </Typography>
        </Box>
        {unreadCount > 0 ? (
          <Button variant="outlined" size="small" onClick={() => markAllRead()}>
            Mark all read
          </Button>
        ) : null}
      </Stack>

      {loading ? (
        <Stack alignItems="center" py={6}>
          <CircularProgress />
        </Stack>
      ) : items.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">No notifications yet.</Typography>
          <Button component={RouterLink} to="/explore" sx={{ mt: 2 }}>
            Explore destinations
          </Button>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {items.map((item) => {
            const hasLink =
              Boolean(item.link) ||
              item.type === "booking" ||
              item.type === "support";

            return (
              <Paper
                key={item.id}
                sx={{
                  p: 2,
                  borderLeft: item.read ? undefined : `4px solid ${designTokens.brand.gold}`,
                  opacity: item.read ? 0.85 : 1,
                  cursor: hasLink ? "pointer" : "default",
                  "&:hover": hasLink ? { bgcolor: "action.hover" } : undefined,
                }}
                onClick={() => {
                  if (hasLink) openNotification(item);
                  else if (!item.read) markRead(item.id);
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Chip size="small" label={item.type} />
                  {!item.read ? <Chip size="small" color="primary" label="New" /> : null}
                </Stack>
                <Typography fontWeight={700}>{item.title}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {item.message}
                </Typography>
                <Typography variant="caption" color="text.disabled" sx={{ mt: 1, display: "block" }}>
                  {new Date(item.createdAt).toLocaleString()}
                </Typography>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
