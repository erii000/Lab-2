import { CloseRounded } from "../../ui/icons.jsx";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";

export default function AppModal({ open, onClose, title, subtitle, children, actions, maxWidth = "sm" }) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth={maxWidth} scroll="body">
      <DialogTitle>
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
          <Stack spacing={0.5}>
            {typeof title === "string" ? (
              <Typography variant="h6" component="span">
                {title}
              </Typography>
            ) : (
              <Box sx={{ flex: 1, minWidth: 0 }}>{title}</Box>
            )}
            {subtitle ? (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            ) : null}
          </Stack>
          <IconButton aria-label="close" onClick={onClose} size="small">
            <CloseRounded />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>{children}</DialogContent>
      {actions ? <DialogActions sx={{ px: 3, py: 2 }}>{actions}</DialogActions> : null}
    </Dialog>
  );
}
