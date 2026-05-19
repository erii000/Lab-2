import { AutoAwesomeRounded } from "../../ui/icons.jsx";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

function Dot({ delay }) {
  return (
    <Box
      sx={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        bgcolor: "primary.main",
        animation: "pulse-dot 1.2s ease infinite",
        animationDelay: `${delay}ms`,
      }}
    />
  );
}

function ShimmerBlock({ height = 72, width = "100%" }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        height,
        width,
        borderRadius: 2,
        background: `linear-gradient(90deg, ${alpha("#1b2435", 0.9)} 0%, ${alpha(theme.palette.primary.main, 0.2)} 50%, ${alpha("#1b2435", 0.9)} 100%)`,
        backgroundSize: "200% 100%",
        animation: "shimmer 1.4s ease-in-out infinite",
      }}
    />
  );
}

export default function AiSearchLoader({ message = "Finding the best trips for you" }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2.5,
        bgcolor: alpha("#0f1524", 0.92),
        border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.35)}`,
        backdropFilter: "blur(12px)",
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
        <AutoAwesomeRounded color="primary" />
        <Typography fontWeight={700}>{message}</Typography>
        <Stack direction="row" spacing={0.6} sx={{ ml: 0.5 }}>
          <Dot delay={0} />
          <Dot delay={200} />
          <Dot delay={400} />
        </Stack>
      </Stack>
      <Stack spacing={1.5}>
        <ShimmerBlock height={88} />
        <ShimmerBlock height={88} />
        <ShimmerBlock height={64} width="70%" />
      </Stack>
    </Paper>
  );
}
