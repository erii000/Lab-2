import { Box, Button, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { adminColors, adminPanelSx } from "../adminStyles.js";

export default function UsersBulkBar({ count, onMarkVip, onDeactivate, onDelete, onClear }) {
  if (!count) return null;
  return (
    <Box sx={{ mb: 2, p: 1.5, ...adminPanelSx, border: `1px solid ${alpha(adminColors.gold, 0.35)}`, bgcolor: alpha(adminColors.gold, 0.06) }}>
      <Stack direction="row" flexWrap="wrap" alignItems="center" gap={1}>
        <Typography variant="body2" fontWeight={700} sx={{ color: "#fff", mr: 1 }}>{count} selected</Typography>
        <Button size="small" variant="contained" onClick={onMarkVip}>Mark VIP</Button>
        <Button size="small" variant="outlined" onClick={onDeactivate} sx={{ borderColor: adminColors.border }}>Deactivate</Button>
        <Button size="small" color="error" onClick={onDelete}>Delete</Button>
        <Button size="small" onClick={onClear} sx={{ ml: "auto", color: adminColors.textMuted }}>Clear</Button>
      </Stack>
    </Box>
  );
}
