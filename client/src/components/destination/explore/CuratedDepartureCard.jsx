import { FlightRounded } from "../../../ui/icons.jsx";
import { Box, Chip, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

function ScoreBar({ label, value }) {
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.3 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="caption" fontWeight={700}>
          {value}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 4,
          borderRadius: 2,
          bgcolor: alpha("#fff", 0.08),
          "& .MuiLinearProgress-bar": { bgcolor: value >= 85 ? "primary.main" : "secondary.main" },
        }}
      />
    </Box>
  );
}

export default function CuratedDepartureCard({ departure, selected, onSelect, image }) {
  const theme = useTheme();

  return (
    <Paper
      onClick={() => onSelect(departure)}
      elevation={0}
      sx={{
        minWidth: 268,
        maxWidth: 288,
        flexShrink: 0,
        cursor: "pointer",
        borderRadius: 2.5,
        overflow: "hidden",
        bgcolor: alpha("#121826", 0.85),
        backdropFilter: "blur(12px)",
        border: "1px solid",
        borderColor: selected ? "transparent" : alpha(theme.palette.primary.main, 0.22),
        backgroundImage: selected
          ? `linear-gradient(${alpha("#121826", 0.94)}, ${alpha("#121826", 0.94)}), linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
          : undefined,
        backgroundOrigin: "border-box",
        backgroundClip: selected ? "padding-box, border-box" : undefined,
        transform: selected ? "translateY(-4px) scale(1.03)" : "none",
        boxShadow: selected ? `0 22px 50px ${alpha(theme.palette.primary.main, 0.35)}` : "0 10px 30px rgba(0,0,0,0.3)",
        transition: "transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 280ms ease",
        animation: "float-up 400ms ease",
        "&:hover": {
          transform: selected ? "translateY(-5px) scale(1.03)" : "translateY(-3px) scale(1.02)",
          boxShadow: `0 20px 44px ${alpha(theme.palette.primary.main, 0.25)}`,
        },
      }}
    >
      <Box
        sx={{
          height: 56,
          backgroundImage: `linear-gradient(90deg, ${alpha("#0b0d12", 0.15)}, ${alpha("#0b0d12", 0.88)}), url(${image})`,
          backgroundSize: "cover",
          position: "relative",
        }}
      >
        <Chip
          label={departure.travelClassLabel}
          size="small"
          sx={{
            position: "absolute",
            left: 10,
            top: 10,
            height: 22,
            fontWeight: 700,
            fontSize: "0.65rem",
            bgcolor: alpha(theme.palette.primary.main, 0.9),
            color: "#111318",
          }}
        />
        <FlightRounded sx={{ position: "absolute", right: 10, top: 10, color: "primary.main", fontSize: 20 }} />
      </Box>
      <Stack spacing={1.1} sx={{ p: 2 }}>
        <Stack direction="row" flexWrap="wrap" gap={0.5}>
          {departure.tags?.map((tag) => (
            <Chip
              key={tag.id}
              label={tag.label}
              size="small"
              sx={{ height: 22, fontSize: "0.65rem", fontWeight: 700 }}
            />
          ))}
        </Stack>
        <Typography variant="caption" color="secondary.light" fontWeight={600}>
          {departure.packageTitle}
        </Typography>
        <Typography fontWeight={800}>
          {departure.label} → {departure.endLabel}
        </Typography>
        <Typography variant="body2" fontWeight={800} color="primary.main">
          €{departure.pricePerPerson.toLocaleString()} / person
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.35 }}>
          {departure.cabinNote} · {departure.slotsLeft} seats · Match {departure.matchScore}%
        </Typography>
        <ScoreBar label="Weather" value={departure.weatherScore} />
        <ScoreBar label="Crowd" value={departure.crowdScore} />
        <ScoreBar label="Comfort" value={departure.comfortScore} />
      </Stack>
    </Paper>
  );
}
