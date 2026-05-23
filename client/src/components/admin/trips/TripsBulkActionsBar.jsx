import { Box, Button, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { adminColors, adminPanelSx } from "../adminStyles.js";

export default function TripsBulkActionsBar({ count, onAction, onClear }) {
  if (!count) return null;
  return (
    <Box sx={{ mb: 2, p: 1.5, ...adminPanelSx, border: `1px solid ${alpha(adminColors.gold, 0.35)}`, bgcolor: alpha(adminColors.gold, 0.06) }}>
      <Stack direction="row" flexWrap="wrap" alignItems="center" gap={1}>
        <Typography variant="body2" fontWeight={700} sx={{ color: "#fff", mr: 1 }}>{count} selected</Typography>
        <Button size="small" variant="contained" onClick={() => onAction("publish")}>Publish</Button>
        <Button size="small" variant="outlined" onClick={() => onAction("archive")} sx={{ borderColor: adminColors.border }}>Archive</Button>
        <Button size="small" color="error" onClick={() => onAction("delete")}>Delete</Button>
        <Button size="small" onClick={onClear} sx={{ ml: "auto", color: adminColors.textMuted }}>Clear</Button>
      </Stack>
    </Box>
  );
}
