import { Chip } from "@mui/material";
import { STATUS_COLORS, STATUS_LABELS } from "../../utils/bookingConstants.js";

export default function BookingStatusChip({ status, size = "small" }) {
  return (
    <Chip
      label={STATUS_LABELS[status] ?? status}
      size={size}
      color={STATUS_COLORS[status] ?? "default"}
      sx={{ fontWeight: 700, letterSpacing: "0.02em" }}
    />
  );
}
