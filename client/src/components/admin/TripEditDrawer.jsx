import { CloseRounded, DeleteOutlineRounded } from "../../ui/icons.jsx";
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { adminColors, adminPanelSx } from "./adminStyles.js";

export default function TripEditDrawer({ trip, open, onClose, onSave, onDelete }) {
  const [draft, setDraft] = useState(trip);

  useEffect(() => {
    setDraft(trip);
  }, [trip]);

  if (!trip || !draft) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 480 },
          bgcolor: adminColors.bg,
          borderLeft: `1px solid ${adminColors.border}`,
        },
      }}
    >
      <Stack sx={{ p: 2.5, height: "100%", overflow: "auto" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Typography variant="h6" fontWeight={800} sx={{ color: "#fff" }}>
            Edit trip
          </Typography>
          <IconButton onClick={onClose} sx={{ color: adminColors.textMuted }}>
            <CloseRounded />
          </IconButton>
        </Stack>

        <Box
          component="img"
          src={draft.image}
          alt=""
          sx={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 2, mb: 2 }}
        />

        <Stack spacing={2} component="form" onSubmit={(e) => { e.preventDefault(); onSave?.(draft); }}>
          <TextField
            label="Trip name"
            fullWidth
            value={draft.title}
            onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Country"
            fullWidth
            value={draft.country}
            onChange={(e) => setDraft({ ...draft, country: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Price from (€)"
            type="number"
            fullWidth
            value={draft.priceFrom}
            onChange={(e) => setDraft({ ...draft, priceFrom: Number(e.target.value) })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="AI description"
            fullWidth
            multiline
            minRows={3}
            value={draft.aiSummary}
            onChange={(e) => setDraft({ ...draft, aiSummary: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Image URL"
            fullWidth
            value={draft.image}
            onChange={(e) => setDraft({ ...draft, image: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />

          <Box sx={{ ...adminPanelSx, p: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#fff", mb: 1.5 }}>
              Itinerary
            </Typography>
            {draft.itinerary?.map((day) => (
              <Box key={day.day} sx={{ mb: 1.5 }}>
                <Typography variant="caption" sx={{ color: adminColors.gold, fontWeight: 700 }}>
                  Day {day.day} — {day.title}
                </Typography>
                <Typography variant="body2" sx={{ color: adminColors.textMuted }}>
                  {day.items.join(" · ")}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ ...adminPanelSx, p: 2 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#fff", mb: 1 }}>
              Activities
            </Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.75}>
              {draft.activities?.map((a) => (
                <Chip key={a.id} label={`${a.name} · €${a.price}`} size="small" sx={{ bgcolor: alpha(adminColors.gold, 0.1) }} />
              ))}
            </Stack>
          </Box>

          <Button type="submit" variant="contained" color="primary" fullWidth sx={{ fontWeight: 700, mt: 1 }}>
            Save changes
          </Button>
          <Button
            variant="text"
            color="error"
            startIcon={<DeleteOutlineRounded />}
            onClick={() => onDelete?.(draft)}
          >
            Delete trip
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
}
