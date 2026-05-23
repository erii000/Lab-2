import { AutoAwesomeRounded, CloseRounded } from "../../../ui/icons.jsx";
import {
  Button,
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
import { useState } from "react";
import { TRIP_STATUSES, TRIP_STYLE_OPTIONS, createEmptyTrip } from "../../../utils/adminTrips.js";
import { adminColors } from "../adminStyles.js";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=80";

export default function CreateTripDrawer({ open, onClose, onCreate, onAiGenerate }) {
  const [draft, setDraft] = useState(() => ({
    ...createEmptyTrip(),
    image: DEFAULT_IMAGE,
    status: "draft",
  }));

  function reset() {
    setDraft({ ...createEmptyTrip(), image: DEFAULT_IMAGE, status: "draft" });
  }

  function handleClose() {
    reset();
    onClose?.();
  }

  function handleCreate() {
    onCreate?.(draft);
    handleClose();
  }

  function handleAi() {
    onAiGenerate?.(draft.title || "Luxury curated escape");
    handleClose();
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 400 }, bgcolor: adminColors.bg, borderLeft: `1px solid ${adminColors.border}` },
      }}
    >
      <Stack sx={{ p: 2.5, height: "100%" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={800} sx={{ color: "#fff" }}>Create trip</Typography>
          <IconButton onClick={handleClose} sx={{ color: adminColors.textMuted }}><CloseRounded /></IconButton>
        </Stack>

        <Stack spacing={2} sx={{ flex: 1 }}>
          <TextField label="Trip name" fullWidth value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} InputLabelProps={{ shrink: true }} />
          <TextField label="Destination" fullWidth value={draft.destination} onChange={(e) => setDraft({ ...draft, destination: e.target.value })} InputLabelProps={{ shrink: true }} />
          <FormControl fullWidth>
            <InputLabel>Style</InputLabel>
            <Select label="Style" value={draft.style} onChange={(e) => setDraft({ ...draft, style: e.target.value })}>
              {TRIP_STYLE_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Price from (€)" type="number" fullWidth value={draft.priceFrom || ""} onChange={(e) => setDraft({ ...draft, priceFrom: Number(e.target.value) })} InputLabelProps={{ shrink: true }} />
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
              {TRIP_STATUSES.map((s) => <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>)}
            </Select>
          </FormControl>
        </Stack>

        <Stack spacing={1} sx={{ mt: 3 }}>
          <Button variant="outlined" startIcon={<AutoAwesomeRounded />} onClick={handleAi} sx={{ borderColor: adminColors.border, color: adminColors.gold }}>
            Generate with AI
          </Button>
          <Button variant="contained" onClick={handleCreate} disabled={!draft.title?.trim()} sx={{ fontWeight: 700 }}>
            Create trip
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}
