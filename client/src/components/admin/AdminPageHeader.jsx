import { Box, Stack, Typography } from "@mui/material";
import { adminColors } from "./adminStyles.js";

export default function AdminPageHeader({ title, subtitle, action }) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "center" }}
      spacing={2}
      sx={{ mb: 3 }}
    >
      <Box>
        <Typography variant="h4" fontWeight={800} sx={{ color: "#fff", letterSpacing: "-0.02em" }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" sx={{ mt: 0.5, color: adminColors.textMuted, maxWidth: 520 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {action}
    </Stack>
  );
}
