import { Box, Typography } from "@mui/material";
import { adminColors } from "./adminStyles.js";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function AdminWelcome() {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h4" fontWeight={800} sx={{ color: "#fff", letterSpacing: "-0.03em" }}>
        {greeting()}, Admin 👋
      </Typography>
      <Typography variant="body1" sx={{ mt: 0.75, color: adminColors.textMuted, maxWidth: 560, lineHeight: 1.6 }}>
        Here&apos;s what&apos;s happening with your travel platform today.
      </Typography>
    </Box>
  );
}
