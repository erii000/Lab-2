import { FlightRounded } from "../../ui/icons.jsx";
import { Box, Chip, LinearProgress, Paper, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

export default function DepartureWindowCard({
  window,
  selected,
  onSelect,
  destinationImage,
}) {
  const theme = useTheme();
  const badgeColor =
    window.badge?.tone === "error"
      ? theme.palette.error.main
      : window.badge?.tone === "warning"
        ? theme.palette.warning.main
        : window.badge?.tone === "success"
          ? theme.palette.success.main
          : theme.palette.secondary.main;

  return (
    <Paper
      elevation={0}
      onClick={() => onSelect(window)}
      sx={{
        p: 0,
        minWidth: 220,
        maxWidth: 240,
        flexShrink: 0,
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        borderRadius: 2.5,
        bgcolor: alpha("#121826", 0.72),
        backdropFilter: "blur(14px)",
        border: "1px solid",
        borderColor: selected
          ? "transparent"
          : alpha(theme.palette.primary.main, 0.22),
        backgroundImage: selected
          ? `linear-gradient(${alpha("#121826", 0.92)}, ${alpha("#121826", 0.92)}), linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
          : undefined,
        backgroundOrigin: "border-box",
        backgroundClip: selected ? "padding-box, border-box" : undefined,
        transform: selected ? "translateY(-4px) scale(1.03)" : "translateY(0) scale(1)",
        boxShadow: selected
          ? `0 20px 48px ${alpha(theme.palette.primary.main, 0.35)}, 0 0 0 1px ${alpha(theme.palette.primary.main, 0.4)}`
          : "0 8px 28px rgba(0,0,0,0.28)",
        transition: "transform 320ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 320ms ease, border-color 280ms ease",
        animation: selected ? "float-up 400ms ease" : "none",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          background: selected
            ? `radial-gradient(circle at 80% 0%, ${alpha(theme.palette.primary.main, 0.2)}, transparent 55%)`
            : "transparent",
          pointerEvents: "none",
          transition: "opacity 300ms",
        },
        "&:hover": {
          transform: selected ? "translateY(-6px) scale(1.03)" : "translateY(-3px) scale(1.02) rotate(-0.4deg)",
          boxShadow: `0 24px 52px ${alpha(theme.palette.primary.main, 0.28)}`,
          "& .card-glow": { opacity: 1 },
          "& .route-line": { strokeDashoffset: 0 },
        },
      }}
    >
      <Box
        className="card-glow"
        sx={{
          position: "absolute",
          inset: -1,
          opacity: 0,
          transition: "opacity 400ms",
          background: `linear-gradient(120deg, transparent, ${alpha(theme.palette.primary.main, 0.15)}, transparent)`,
          pointerEvents: "none",
        }}
      />
      <Box
        sx={{
          height: 56,
          backgroundImage: `linear-gradient(90deg, ${alpha("#0b0d12", 0.3)}, ${alpha("#0b0d12", 0.85)}), url(${destinationImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        <svg width="100%" height="56" style={{ position: "absolute", inset: 0 }}>
          <path
            className="route-line"
            d="M 12 40 Q 80 8 140 28 T 220 20"
            fill="none"
            stroke={alpha(theme.palette.primary.main, 0.65)}
            strokeWidth="1.5"
            strokeDasharray="8 6"
            strokeDashoffset={selected ? 0 : 40}
            style={{ transition: "stroke-dashoffset 600ms ease" }}
          />
        </svg>
        <FlightRounded
          sx={{
            position: "absolute",
            right: 10,
            top: 10,
            fontSize: 20,
            color: "primary.main",
            animation: selected ? "float-up 500ms ease" : "none",
          }}
        />
      </Box>

      <Stack spacing={1} sx={{ p: 2, position: "relative" }}>
        {window.badge ? (
          <Chip
            label={window.badge.label}
            size="small"
            sx={{
              alignSelf: "flex-start",
              height: 24,
              fontWeight: 700,
              fontSize: "0.7rem",
              bgcolor: alpha(badgeColor, 0.18),
              color: badgeColor,
              border: `1px solid ${alpha(badgeColor, 0.45)}`,
            }}
          />
        ) : null}
        <Typography fontWeight={800} variant="subtitle1">
          {window.label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {window.start} → {window.end}
        </Typography>
        <Typography variant="body2" fontWeight={800} sx={{ color: "primary.main" }}>
          €{window.pricePerPerson.toLocaleString()} / person
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1}>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, (window.slotsLeft / 12) * 100)}
            sx={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              "& .MuiLinearProgress-bar": { bgcolor: window.slotsLeft <= 4 ? "error.main" : "primary.main" },
            }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
            {window.slotsLeft} seats
          </Typography>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.35 }}>
          Score {window.travelScore}/100 · {window.routeLabel}
        </Typography>
      </Stack>
    </Paper>
  );
}
