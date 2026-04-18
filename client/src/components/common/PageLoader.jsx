import { Box, CircularProgress, Typography } from "@mui/material";

export default function PageLoader({ label = "Loading…" }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        py: 12,
      }}
    >
      <CircularProgress color="secondary" />
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}
