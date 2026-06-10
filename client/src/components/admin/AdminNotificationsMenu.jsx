import {
  ExploreRounded,
  NotificationsOutlined,
  StarRounded,
  ViewListRounded,
} from "../../ui/icons.jsx";
import {
  Box,
  Button,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminColors } from "./adminStyles.js";
import { useAdminNotificationsStore } from "../../store/adminNotificationsStore.js";
import { formatNotificationTime, NOTIFICATION_TYPE_LABELS } from "../../utils/adminNotifications.js";

const typeIcons = {
  booking: ViewListRounded,
  trip: ExploreRounded,
  user: StarRounded,
  support: NotificationsOutlined,
  system: NotificationsOutlined,
};

export default function AdminNotificationsMenu() {
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState(null);
  const items = useAdminNotificationsStore((s) => s.items);
  const markRead = useAdminNotificationsStore((s) => s.markRead);
  const markAllRead = useAdminNotificationsStore((s) => s.markAllRead);
  const clearAll = useAdminNotificationsStore((s) => s.clearAll);

  const unread = items.filter((n) => !n.read).length;
  const open = Boolean(anchor);

  function handleOpen(e) {
    setAnchor(e.currentTarget);
  }

  function handleClose() {
    setAnchor(null);
  }

  function openNotification(item) {
    void markRead(item.id);
    handleClose();
    if (item.type === "support" && (item.chatUserId || item.entityId?.startsWith("user-"))) {
      const userId = item.chatUserId ?? item.entityId.replace("user-", "");
      navigate(`/admin/messages?user=${encodeURIComponent(userId)}`);
      return;
    }
    if (item.link) {
      const url = item.entityId?.startsWith("BK-")
        ? `${item.link}?booking=${encodeURIComponent(item.entityId)}`
        : item.link;
      navigate(url);
    }
  }

  return (
    <>
      <IconButton
        onClick={handleOpen}
        aria-label="Notifications"
        aria-controls={open ? "admin-notifications-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        sx={{
          color: adminColors.textMuted,
          border: `1px solid ${adminColors.border}`,
          borderRadius: 2,
        }}
      >
        <Box component="span" sx={{ position: "relative", display: "inline-flex" }}>
          <NotificationsOutlined fontSize="small" />
          {unread > 0 ? (
            <Box
              sx={{
                position: "absolute",
                top: -2,
                right: -2,
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: adminColors.gold,
                border: `2px solid ${adminColors.surface}`,
              }}
            />
          ) : null}
        </Box>
      </IconButton>

      <Menu
        id="admin-notifications-menu"
        anchorEl={anchor}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              width: { xs: "min(100vw - 24px, 360px)", sm: 380 },
              maxHeight: 440,
              bgcolor: adminColors.surface,
              border: `1px solid ${adminColors.border}`,
              borderRadius: 2,
              backgroundImage: "none",
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.25, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
          <Box>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: adminColors.gold }}>
              Notifications
            </Typography>
            <Typography variant="caption" sx={{ color: adminColors.textMuted }}>
              {unread > 0 ? `${unread} unread · live` : "Live via WebSocket"}
            </Typography>
          </Box>
          {items.length > 0 ? (
            <Box sx={{ display: "flex", gap: 0.5 }}>
              {unread > 0 ? (
                <Button
                  size="small"
                  onClick={() => void markAllRead()}
                  sx={{ minWidth: 0, fontSize: "0.7rem", color: adminColors.gold }}
                >
                  Mark read
                </Button>
              ) : null}
              <Button size="small" onClick={clearAll} sx={{ minWidth: 0, fontSize: "0.7rem", color: adminColors.textMuted }}>
                Clear
              </Button>
            </Box>
          ) : null}
        </Box>

        <Divider sx={{ borderColor: adminColors.border }} />

        {items.length === 0 ? (
          <Box sx={{ px: 2, py: 3, textAlign: "center" }}>
            <NotificationsOutlined sx={{ fontSize: 28, color: adminColors.textMuted, mb: 1, opacity: 0.6 }} />
            <Typography variant="body2" sx={{ color: adminColors.textMuted }}>
              No notifications yet. Actions you take in admin will appear here.
            </Typography>
          </Box>
        ) : (
          <List dense disablePadding sx={{ maxHeight: 320, overflow: "auto", py: 0.5 }}>
            {items.map((item) => {
              const Icon = typeIcons[item.type] ?? NotificationsOutlined;
              return (
                <ListItemButton
                  key={item.id}
                  onClick={() => openNotification(item)}
                  sx={{
                    alignItems: "flex-start",
                    py: 1.25,
                    px: 2,
                    bgcolor: item.read ? "transparent" : alpha(adminColors.gold, 0.06),
                    "&:hover": { bgcolor: alpha(adminColors.gold, 0.1) },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 36, mt: 0.25, color: adminColors.gold }}>
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={item.read ? 500 : 700} sx={{ color: "#fff", lineHeight: 1.3 }}>
                        {item.title}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography component="span" variant="caption" sx={{ color: adminColors.textMuted, display: "block", lineHeight: 1.45, mt: 0.25 }}>
                          {item.message}
                        </Typography>
                        <Typography component="span" variant="caption" sx={{ color: adminColors.gold, display: "block", mt: 0.5, fontSize: "0.65rem" }}>
                          {NOTIFICATION_TYPE_LABELS[item.type] ?? "System"} · {formatNotificationTime(item.createdAt)}
                        </Typography>
                      </>
                    }
                  />
                  {!item.read ? (
                    <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: adminColors.gold, mt: 1, flexShrink: 0 }} />
                  ) : null}
                </ListItemButton>
              );
            })}
          </List>
        )}
      </Menu>
    </>
  );
}
