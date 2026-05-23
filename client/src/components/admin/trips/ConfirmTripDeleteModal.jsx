import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { adminColors } from "../adminStyles.js";

export default function ConfirmTripDeleteModal({ open, trip, onConfirm, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>Delete trip?</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: adminColors.textMuted, lineHeight: 1.6 }}>
          Remove {trip?.title}? This cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: adminColors.textMuted }}>Cancel</Button>
        <Button variant="contained" color="error" onClick={onConfirm} sx={{ fontWeight: 700 }}>Delete</Button>
      </DialogActions>
    </Dialog>
  );
}
