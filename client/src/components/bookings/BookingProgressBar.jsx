import { Box, LinearProgress, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { designTokens } from "../../theme/theme.js";

export default function BookingProgressBar({ value, showLabel = true }) {
  return (
    <Stack spacing={0.5}>
      {showLabel ? (
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Progress
          </Typography>
          <Typography variant="caption" fontWeight={800} sx={{ color: designTokens.brand.champagne }}>
            {value}% completed
          </Typography>
        </Stack>
      ) : null}
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 6,
          borderRadius: 3,
          bgcolor: alpha("#fff", 0.08),
          "& .MuiLinearProgress-bar": {
            borderRadius: 3,
            background: `linear-gradient(90deg, ${designTokens.brand.navy}, ${designTokens.brand.gold})`,
          },
        }}
      />
    </Stack>
  );
}
