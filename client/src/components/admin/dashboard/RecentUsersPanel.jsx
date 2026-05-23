import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import { getTravelerStatusMeta } from "../../../utils/adminUsers.js";
import { adminColors, adminPanelSx } from "../adminStyles.js";

export default function RecentUsersPanel({ recent, flagged }) {
  return (
    <Paper sx={{ ...adminPanelSx, p: 2, height: "100%" }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography variant="subtitle2" fontWeight={700} sx={{ color: adminColors.gold }}>
          Users snapshot
        </Typography>
        <Button component={RouterLink} to="/admin/users" size="small" sx={{ color: adminColors.gold, fontWeight: 600, minWidth: 0 }}>
          View all
        </Button>
      </Stack>
      {flagged?.length ? (
        <Box
          sx={{
            mb: 1.5,
            p: 1.25,
            borderRadius: 2,
            bgcolor: alpha(adminColors.gold, 0.06),
            border: `1px solid ${adminColors.border}`,
          }}
        >
          <Typography variant="caption" sx={{ color: adminColors.textMuted, display: "block", mb: 0.75 }}>
            Flagged accounts
          </Typography>
          {flagged.map((u) => (
            <Stack key={u.id} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 0.35 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {u.name}
              </Typography>
              <Button component={RouterLink} to="/admin/users" size="small" sx={{ minWidth: 0, color: adminColors.gold, fontSize: "0.7rem" }}>
                Review
              </Button>
            </Stack>
          ))}
        </Box>
      ) : null}
      <Typography variant="caption" sx={{ color: adminColors.textMuted, display: "block", mb: 0.75 }}>
        Recent travelers
      </Typography>
      <Stack spacing={0.5}>
        {(recent ?? []).map((u) => {
          const meta = getTravelerStatusMeta(u.travelerStatus);
          return (
            <Stack
              key={u.id}
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ py: 0.65, borderBottom: `1px solid ${adminColors.border}` }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {u.name}
              </Typography>
              <Chip
                label={meta.label}
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: "0.65rem", borderColor: adminColors.border, color: adminColors.textMuted }}
              />
            </Stack>
          );
        })}
      </Stack>
    </Paper>
  );
}
