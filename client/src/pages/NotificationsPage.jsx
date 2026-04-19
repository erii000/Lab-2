import { NotificationsOutlined } from "../ui/icons.jsx";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useMemo, useState } from "react";
import SectionHeading from "../components/common/SectionHeading.jsx";
import { useNotifications } from "../context/NotificationsContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function NotificationsPage() {
  const [filter, setFilter] = useState("all");
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { showToast } = useToast();

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((item) => item.unread);
    }
    return notifications;
  }, [filter, notifications]);

  const groupedNotifications = useMemo(() => {
    return filteredNotifications.reduce((groups, item) => {
      const label = item.timestamp.startsWith("Today")
        ? "Today"
        : item.timestamp.startsWith("Yesterday")
          ? "Yesterday"
          : "Earlier";
      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(item);
      return groups;
    }, {});
  }, [filteredNotifications]);

  const groupOrder = ["Today", "Yesterday", "Earlier"];

  return (
    <Box sx={{ py: { xs: 5, md: 8 } }}>
      <Container maxWidth="lg">
        <SectionHeading
          eyebrow="Control Center"
          title="Notifications"
          subtitle="A complete history of travel updates, booking events, reminders, and AI planning alerts."
        />

        <Paper
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.28)}`,
            background: "linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            sx={{ mb: 2 }}
          >
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.16),
                  color: "primary.main",
                  border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.45)}`,
                }}
              >
                <NotificationsOutlined />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Full Notification History
              </Typography>
              <Chip
                label={`${notifications.length} total`}
                size="small"
                sx={{ borderColor: (theme) => alpha(theme.palette.primary.main, 0.38) }}
                variant="outlined"
              />
              <Chip color="primary" label={`${unreadCount} unread`} size="small" />
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <ToggleButtonGroup
                exclusive
                size="small"
                value={filter}
                onChange={(_, value) => {
                  if (value) {
                    setFilter(value);
                  }
                }}
                sx={{
                  "& .MuiToggleButton-root": {
                    px: 2,
                    borderColor: (theme) => alpha(theme.palette.primary.main, 0.35),
                    color: "text.secondary",
                  },
                  "& .Mui-selected": {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.15),
                    color: "primary.main",
                  },
                }}
              >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="unread">Unread</ToggleButton>
              </ToggleButtonGroup>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  if (unreadCount === 0) {
                    showToast({
                      message: "There are no unread notifications.",
                      severity: "error",
                    });
                    return;
                  }
                  markAllAsRead();
                  showToast({
                    message: "All notifications marked as read.",
                    severity: "success",
                  });
                }}
                sx={{ borderColor: (theme) => alpha(theme.palette.primary.main, 0.38) }}
              >
                Mark all as read
              </Button>
            </Stack>
          </Stack>

          <Divider sx={{ borderColor: (theme) => alpha(theme.palette.primary.main, 0.2), mb: 2 }} />

          <Stack spacing={2.5}>
            {groupOrder.map((group) => {
              const items = groupedNotifications[group];
              if (!items?.length) {
                return null;
              }

              return (
                <Stack key={group} spacing={1.2}>
                  <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: "0.13em" }}>
                    {group}
                  </Typography>

                  {items.map((item) => (
                    <Paper
                      key={item.id}
                      onClick={() => {
                        if (item.unread) {
                          markAsRead(item.id);
                          showToast({
                            message: "Notification marked as read.",
                            severity: "success",
                            autoHideDuration: 2200,
                          });
                        }
                      }}
                      sx={{
                        p: 2,
                        borderRadius: 2.2,
                        border: (theme) =>
                          `1px solid ${item.unread ? alpha(theme.palette.primary.main, 0.52) : alpha(theme.palette.primary.main, 0.2)}`,
                        background: (theme) =>
                          item.unread
                            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha("#0f172a", 0.55)} 100%)`
                            : "transparent",
                      }}
                    >
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }}>
                        <Stack spacing={0.4} sx={{ minWidth: 0 }}>
                          <Stack direction="row" spacing={0.8} alignItems="center" sx={{ flexWrap: "wrap" }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                              {item.title}
                            </Typography>
                            {item.unread && <Chip label="New" size="small" color="primary" />}
                            <Chip label={item.category} size="small" variant="outlined" />
                          </Stack>
                          <Typography color="text.secondary">{item.body}</Typography>
                        </Stack>
                        <Typography variant="caption" sx={{ color: "text.secondary", whiteSpace: "nowrap", pt: { xs: 0.6, sm: 0 } }}>
                          {item.timestamp}
                        </Typography>
                      </Stack>
                    </Paper>
                  ))}
                </Stack>
              );
            })}

            {!filteredNotifications.length && (
              <Paper sx={{ p: 3, borderRadius: 2.2, textAlign: "center" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  No unread notifications
                </Typography>
                <Typography color="text.secondary">
                  You are all caught up. New travel updates will appear here.
                </Typography>
              </Paper>
            )}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
