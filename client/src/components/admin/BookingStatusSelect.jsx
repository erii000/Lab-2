import { MenuItem, Select } from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  BOOKING_STATUS_OPTIONS,
  normalizeStatusKey,
} from "../../store/adminBookingsStore.js";
import { bookingStatusColors } from "../../data/adminData.js";

const chipColors = {
  success: { bg: alpha("#22c55e", 0.18), color: "#4ade80" },
  warning: { bg: alpha("#f59e0b", 0.18), color: "#fbbf24" },
  error: { bg: alpha("#ef4444", 0.18), color: "#f87171" },
  info: { bg: alpha("#3b82f6", 0.18), color: "#60a5fa" },
  default: { bg: alpha("#94a3b8", 0.15), color: "#cbd5e1" },
};

export default function BookingStatusSelect({ bookingId, status, onChange, size = "small" }) {
  const statusKey = normalizeStatusKey(status);
  const muiColor = bookingStatusColors[statusKey] ?? "default";
  const palette = chipColors[muiColor] ?? chipColors.default;

  return (
    <Select
      size={size}
      value={statusKey}
      onChange={(e) => onChange?.(bookingId, e.target.value)}
      onClick={(e) => e.stopPropagation()}
      sx={{
        minWidth: 108,
        height: 28,
        fontSize: "0.75rem",
        fontWeight: 700,
        color: palette.color,
        bgcolor: palette.bg,
        borderRadius: 10,
        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
        "& .MuiSelect-select": { py: 0.5, px: 1.25 },
        "& .MuiSvgIcon-root": { color: palette.color, opacity: 0.7 },
        "&:hover": { bgcolor: alpha(palette.bg, 1.2) },
      }}
    >
      {BOOKING_STATUS_OPTIONS.map((opt) => (
        <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
          {opt.label}
        </MenuItem>
      ))}
    </Select>
  );
}
