import { AutoAwesomeRounded, CloseRounded, EditRounded } from "../../../ui/icons.jsx";
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { loadUserPreferences } from "../../../services/travelPreferencesSync.js";
import { useAuthStore } from "../../../store/authStore.js";
import { getTravelerStatusMeta, TRAVELER_STATUS_OPTIONS } from "../../../utils/adminUsers.js";
import { adminColors, adminPanelSx } from "../adminStyles.js";

function SectionTitle({ children }) {
  return (
    <Typography variant="overline" sx={{ color: adminColors.textMuted, fontWeight: 700, letterSpacing: "0.08em", display: "block", mb: 1.5 }}>
      {children}
    </Typography>
  );
}

export default function UserDetailDrawer({
  user,
  open,
  onClose,
  onUpdate,
  onSetStatus,
  onDeactivate,
  onSuspend,
  onDelete,
  onQuickAction,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const session = useAuthStore((s) => s.session);

  useEffect(() => {
    if (!user) return;
    setDraft({ ...user, preferencesText: (user.preferences ?? []).join(", ") });
    setEditing(false);
    const numericId = Number(String(user.id).replace(/\D/g, ""));
    if (!session?.accessToken || !Number.isFinite(numericId)) return;
    loadUserPreferences(session.accessToken, numericId, { asAdmin: true })
      .then((tags) => {
        if (tags?.length) {
          setDraft((d) => (d ? { ...d, preferencesText: tags.join(", ") } : d));
        }
      })
      .catch(() => null);
  }, [user, session?.accessToken]);

  if (!user || !draft) return null;

  const statusMeta = getTravelerStatusMeta(draft.travelerStatus);

  function saveEdit() {
    void onUpdate?.(user.id, {
      name: draft.name,
      email: draft.email,
      travelerStatus: draft.travelerStatus,
      preferences: draft.preferencesText.split(",").map((s) => s.trim()).filter(Boolean),
    });
    setEditing(false);
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 420 },
          bgcolor: adminColors.bg,
          borderLeft: `1px solid ${adminColors.border}`,
        },
      }}
    >
      <Stack sx={{ height: "100%" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ p: 2.5, pb: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {editing ? (
              <TextField fullWidth size="small" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} sx={{ mb: 1 }} />
            ) : (
              <Typography variant="h5" fontWeight={800} sx={{ color: "#fff" }}>
                {draft.name}
              </Typography>
            )}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1, flexWrap: "wrap" }}>
              {editing ? (
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Status</InputLabel>
                  <Select label="Status" value={draft.travelerStatus} onChange={(e) => setDraft({ ...draft, travelerStatus: e.target.value })}>
                    {TRAVELER_STATUS_OPTIONS.map((s) => (
                      <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              ) : (
                <Chip label={statusMeta.label} size="small" color={statusMeta.color} sx={{ fontWeight: 700 }} />
              )}
            </Stack>
            <Typography variant="body2" sx={{ color: adminColors.textMuted, mt: 1.5 }}>
              €{draft.totalSpent?.toLocaleString()} spent · Last active {draft.lastActive}
            </Typography>
            {editing ? (
              <TextField fullWidth size="small" label="Email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} sx={{ mt: 1.5 }} InputLabelProps={{ shrink: true }} />
            ) : null}
          </Box>
          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              onClick={() => (editing ? saveEdit() : setEditing(true))}
              sx={{ color: adminColors.gold }}
            >
              <EditRounded fontSize="small" />
            </IconButton>
            <IconButton onClick={onClose} sx={{ color: adminColors.textMuted }}>
              <CloseRounded />
            </IconButton>
          </Stack>
        </Stack>

        <Box sx={{ flex: 1, overflow: "auto", px: 2.5, pb: 2.5 }}>
          <SectionTitle>Overview</SectionTitle>
          <Stack spacing={1} sx={{ mb: 3 }}>
            <Row label="Trips" value={draft.trips} />
            <Row label="Bookings" value={draft.bookings} />
            <Row label="Favorite" value={draft.favoriteDestination} />
          </Stack>

          <SectionTitle>Travel preferences</SectionTitle>
          {editing ? (
            <TextField
              fullWidth
              size="small"
              multiline
              minRows={2}
              placeholder="luxury, beach, europe"
              value={draft.preferencesText}
              onChange={(e) => setDraft({ ...draft, preferencesText: e.target.value })}
              sx={{ mb: 3 }}
              InputLabelProps={{ shrink: true }}
            />
          ) : (
            <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 3 }}>
              {(draft.preferences ?? []).map((p) => (
                <Chip key={p} label={p} size="small" sx={{ textTransform: "capitalize", bgcolor: alpha(adminColors.gold, 0.1) }} />
              ))}
            </Stack>
          )}

          <SectionTitle>AI insights</SectionTitle>
          <Box sx={{ ...adminPanelSx, p: 2, mb: 3, bgcolor: alpha(adminColors.gold, 0.05) }}>
            <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
              <AutoAwesomeRounded sx={{ color: adminColors.gold, fontSize: 18 }} />
              <Typography variant="caption" sx={{ color: adminColors.textMuted, fontWeight: 600 }}>Read only</Typography>
            </Stack>
            {(draft.aiInsights ?? []).map((line) => (
              <Typography key={line} variant="body2" sx={{ color: adminColors.textMuted, lineHeight: 1.55, mb: 0.75 }}>
                · {line}
              </Typography>
            ))}
            <Typography variant="caption" sx={{ color: adminColors.textMuted, display: "block", mt: 2, mb: 0.75 }}>
              Suggested destinations
            </Typography>
            {(draft.suggestedDestinations ?? []).map((d) => (
              <Typography key={d} variant="body2" sx={{ color: "#fff", fontWeight: 500 }}>
                — {d}
              </Typography>
            ))}
          </Box>

          <SectionTitle>Activity</SectionTitle>
          <Stack spacing={0} sx={{ mb: 3 }}>
            {(draft.activity ?? []).map((item, i) => (
              <Box key={item.id} sx={{ py: 1.25, borderBottom: i < draft.activity.length - 1 ? `1px solid ${alpha("#fff", 0.04)}` : "none" }}>
                <Typography variant="body2" sx={{ color: "#fff" }}>{item.text}</Typography>
                <Typography variant="caption" sx={{ color: adminColors.textMuted }}>{item.at}</Typography>
              </Box>
            ))}
          </Stack>

          <Divider sx={{ borderColor: adminColors.border, mb: 2 }} />
          <Stack spacing={1}>
            <Button size="small" variant="outlined" onClick={() => onQuickAction?.("recommendation", user)} sx={{ borderColor: adminColors.border, justifyContent: "flex-start" }}>
              Generate recommendation
            </Button>
            <Button size="small" variant="outlined" onClick={() => onQuickAction?.("offer", user)} sx={{ borderColor: adminColors.border, justifyContent: "flex-start" }}>
              Send offer
            </Button>
            <Button size="small" variant="outlined" onClick={() => onSetStatus?.(user.id, "vip")} sx={{ borderColor: adminColors.border, color: adminColors.gold, justifyContent: "flex-start" }}>
              Assign VIP
            </Button>
          </Stack>
        </Box>

        <Stack direction="row" spacing={1} sx={{ p: 2, borderTop: `1px solid ${adminColors.border}` }}>
          <Button size="small" onClick={() => onDeactivate?.(user.id)} sx={{ color: adminColors.textMuted }}>Deactivate</Button>
          <Button size="small" onClick={() => onSuspend?.(user.id)} sx={{ color: adminColors.textMuted }}>Suspend</Button>
          <Button size="small" color="error" onClick={() => onDelete?.(user)} sx={{ ml: "auto" }}>
            Delete
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}

function Row({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2" sx={{ color: adminColors.textMuted }}>{label}</Typography>
      <Typography variant="body2" fontWeight={600} sx={{ color: "#fff" }}>{value}</Typography>
    </Stack>
  );
}
