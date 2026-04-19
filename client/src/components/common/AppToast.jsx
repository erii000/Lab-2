import { Alert, Snackbar } from "@mui/material";

export default function AppToast({
  open,
  message,
  severity = "success",
  autoHideDuration = 3200,
  onClose,
}) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: "100%", minWidth: 280, boxShadow: "0 16px 30px rgba(0,0,0,0.35)" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
