import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from "@mui/material";
import { adminColors } from "../adminStyles.js";

export default function ConfirmUserActionModal({ open, title, message, confirmLabel, onConfirm, onClose }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800 }}>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: adminColors.textMuted, lineHeight: 1.6 }}>{message}</Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: adminColors.textMuted }}>Cancel</Button>
        <Button variant="contained" color="error" onClick={onConfirm} sx={{ fontWeight: 700 }}>
          {confirmLabel ?? "Confirm"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
