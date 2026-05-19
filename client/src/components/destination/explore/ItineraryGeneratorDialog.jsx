import { AutoAwesomeRounded, CloseRounded } from "../../../ui/icons.jsx";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

export default function ItineraryGeneratorDialog({ open, onClose, destination, itinerary }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" scroll="body">
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1} alignItems="center">
            <AutoAwesomeRounded color="primary" />
            <Typography variant="h6" fontWeight={800}>
              AI itinerary generator
            </Typography>
          </Stack>
          <IconButton onClick={onClose} size="small">
            <CloseRounded />
          </IconButton>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {destination?.title} · day-by-day plan
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          {itinerary?.map((day) => (
            <Box
              key={day.day}
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
                border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.2)}`,
              }}
            >
              <Typography variant="overline" color="primary">
                Day {day.day}
              </Typography>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                {day.title}
              </Typography>
              {day.items.map((item) => (
                <Typography key={item} variant="body2" color="text.secondary" sx={{ pl: 1 }}>
                  • {item}
                </Typography>
              ))}
            </Box>
          ))}
        </Stack>
        <Button variant="contained" color="secondary" fullWidth sx={{ mt: 3 }} onClick={onClose}>
          Use this itinerary
        </Button>
      </DialogContent>
    </Dialog>
  );
}
