import { AutoAwesomeRounded, CloseRounded, EditRounded, MoreVertRounded } from "../../../ui/icons.jsx";
import {
  Box,
  Button,
  Chip,
  Drawer,
  IconButton,
  InputLabel,
  Menu,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { getTripStatusMeta, TRIP_STATUSES } from "../../../utils/adminTrips.js";
import { adminColors, adminPanelSx } from "../adminStyles.js";

const AI_ACTIONS = [
  "Generate description",
  "Optimize pricing",
  "Suggest activities",
  "Translate trip",
  "Improve SEO",
];

function Section({ title, children }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="overline" sx={{ color: adminColors.textMuted, fontWeight: 700, letterSpacing: "0.08em", mb: 1.5, display: "block" }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

export default function TripWorkspaceDrawer({
  trip,
  open,
  onClose,
  onUpdate,
  onPublish,
  onMenuAction,
  onAiAction,
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [menuAnchor, setMenuAnchor] = useState(null);

  useEffect(() => {
    if (trip) setDraft(JSON.parse(JSON.stringify(trip)));
    setEditing(false);
    setAiPrompt("");
  }, [trip]);

  if (!trip || !draft) return null;

  const statusMeta = getTripStatusMeta(draft.status);

  function save() {
    onUpdate?.(draft);
    setEditing(false);
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 440 }, bgcolor: adminColors.bg, borderLeft: `1px solid ${adminColors.border}` },
      }}
    >
      <Stack sx={{ height: "100%" }}>
        <Box
          component="img"
          src={draft.image}
          alt=""
          sx={{ width: "100%", height: 160, objectFit: "cover" }}
        />
        <Stack sx={{ flex: 1, overflow: "auto", px: 2.5, py: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {editing ? (
                <TextField fullWidth size="small" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} sx={{ mb: 1 }} />
              ) : (
                <Typography variant="h5" fontWeight={800} sx={{ color: "#fff" }}>{draft.title}</Typography>
              )}
              <Typography variant="body2" sx={{ color: adminColors.textMuted }}>{draft.country}</Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip label={statusMeta.label} size="small" color={statusMeta.color} sx={{ fontWeight: 700 }} />
                <Chip label={`AI ${draft.aiScore}`} size="small" sx={{ bgcolor: alpha("#fff", 0.06), color: adminColors.textMuted, fontWeight: 600 }} />
              </Stack>
            </Box>
            <Stack direction="row">
              <IconButton size="small" onClick={() => (editing ? save() : setEditing(true))} sx={{ color: adminColors.gold }}>
                <EditRounded fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)} sx={{ color: adminColors.textMuted }}>
                <MoreVertRounded fontSize="small" />
              </IconButton>
              <IconButton onClick={onClose} sx={{ color: adminColors.textMuted }}><CloseRounded /></IconButton>
            </Stack>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ my: 2 }}>
            <Button size="small" variant="contained" onClick={() => onPublish?.(draft)} sx={{ fontWeight: 700 }}>Publish</Button>
            <Button size="small" variant="outlined" onClick={() => window.open(`/destination/${draft.id}`, "_blank")} sx={{ borderColor: adminColors.border }}>
              Preview
            </Button>
          </Stack>

          <Section title="Overview">
            <Stack spacing={1}>
              <Row label="Pricing" value={`€${draft.priceFrom?.toLocaleString()}`} />
              <Row label="Style" value={draft.style} />
              <Row label="Duration" value={`${draft.days} days`} />
              <Row label="Capacity" value={draft.capacity} />
              <Row label="Bookings" value={draft.bookings} />
            </Stack>
          </Section>

          <Section title="Experience">
            {editing ? (
              <>
                <TextField fullWidth multiline minRows={2} label="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} sx={{ mb: 1.5 }} InputLabelProps={{ shrink: true }} />
                <TextField fullWidth label="Highlights" value={(draft.activities ?? []).map((a) => (typeof a === "string" ? a : a.name)).join(", ")} onChange={(e) => setDraft({ ...draft, activities: e.target.value.split(",").map((s) => s.trim()) })} InputLabelProps={{ shrink: true }} />
              </>
            ) : (
              <>
                <Typography variant="body2" sx={{ color: adminColors.textMuted, lineHeight: 1.65, mb: 1.5 }}>{draft.description || "No description yet."}</Typography>
                <Typography variant="caption" sx={{ color: adminColors.textMuted }}>Itinerary · {(draft.itinerary ?? []).length} days</Typography>
              </>
            )}
          </Section>

          <Section title="AI tools">
            <Box sx={{ ...adminPanelSx, p: 1.5 }}>
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mb: 1 }}>
                <AutoAwesomeRounded sx={{ color: adminColors.gold, fontSize: 18 }} />
                <Typography variant="caption" sx={{ color: adminColors.textMuted }}>Ask AI</Typography>
              </Stack>
              <TextField
                fullWidth
                size="small"
                placeholder="Improve itinerary, add luxury activities…"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && aiPrompt.trim() && onAiAction?.(draft, aiPrompt)}
                sx={{ mb: 1 }}
              />
              <Stack direction="row" flexWrap="wrap" gap={0.5}>
                {AI_ACTIONS.map((label) => (
                  <Chip
                    key={label}
                    label={label}
                    size="small"
                    onClick={() => onAiAction?.(draft, label)}
                    sx={{ fontSize: "0.65rem", bgcolor: alpha(adminColors.gold, 0.08), border: `1px solid ${alpha(adminColors.gold, 0.2)}` }}
                  />
                ))}
              </Stack>
            </Box>
          </Section>

          <Section title="Media">
            <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: 0.5 }}>
              {(draft.gallery?.length ? draft.gallery : [draft.image]).slice(0, 4).map((url, i) => (
                <Box key={i} component="img" src={url} alt="" sx={{ width: 72, height: 72, borderRadius: 1.5, objectFit: "cover", flexShrink: 0 }} />
              ))}
            </Stack>
          </Section>
        </Stack>
      </Stack>

      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => { setMenuAnchor(null); onMenuAction?.("duplicate", trip); }}>Duplicate</MenuItem>
        <MenuItem onClick={() => { setMenuAnchor(null); onMenuAction?.("archive", trip); }}>Archive</MenuItem>
        <MenuItem onClick={() => { setMenuAnchor(null); onMenuAction?.("delete", trip); }} sx={{ color: "error.main" }}>Delete</MenuItem>
      </Menu>
    </Drawer>
  );
}

function Row({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between">
      <Typography variant="body2" sx={{ color: adminColors.textMuted }}>{label}</Typography>
      <Typography variant="body2" fontWeight={600} sx={{ color: "#fff", textTransform: "capitalize" }}>{value}</Typography>
    </Stack>
  );
}
