import { Backdrop, CircularProgress, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

export default function GlobalLoader({ open, label = "Loading data..." }) {
  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 20,
        bgcolor: alpha("#070b14", 0.78),
        backdropFilter: "blur(4px)",
      }}
    >
      <Stack
        spacing={1.4}
        alignItems="center"
        sx={{
          px: 3,
          py: 2.2,
          borderRadius: 2,
          border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.4)}`,
          bgcolor: alpha("#111827", 0.82),
        }}
      >
        <CircularProgress color="primary" />
        <Typography variant="body2" sx={{ color: "text.secondary", letterSpacing: "0.01em" }}>
          {label}
        </Typography>
      </Stack>
    </Backdrop>
  );
}
