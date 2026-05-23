import { CloseRounded, VerifiedRounded } from "../../ui/icons.jsx";
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { bookingStatusColors, bookingStatusLabels } from "../../data/adminData.js";
import { normalizeStatusKey } from "../../store/adminBookingsStore.js";
import { adminColors, adminPanelSx } from "./adminStyles.js";
import { ActivityTimeline, AdminActionsHistory } from "./BookingActivityTimeline.jsx";

const paymentLabels = { card: "Credit / debit card", paypal: "PayPal", apple: "Apple Pay" };

function Section({ title, children }) {
  return (
    <Box sx={{ ...adminPanelSx, p: 2, mb: 2 }}>
      <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#fff", mb: 1.5 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

export default function BookingDetailDrawer({
  booking,
  open,
  onClose,
  onApprove,
  onRequestCancel,
  onRequestRefund,
}) {
  if (!booking) return null;

  const statusKey = normalizeStatusKey(booking.status);
  const statusColor = bookingStatusColors[statusKey] ?? "default";
  const canCancel = !["cancelled", "refunded"].includes(booking.status);
  const canRefund = !["cancelled", "refunded", "partially_refunded"].includes(booking.status) && booking.status !== "pending";

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 460 },
          bgcolor: adminColors.bg,
          borderLeft: `1px solid ${adminColors.border}`,
        },
      }}
    >
      <Stack sx={{ p: 2.5, height: "100%", overflow: "auto" }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
          <Box>
            <Typography variant="overline" sx={{ color: adminColors.gold, fontWeight: 800 }}>
              {booking.id}
            </Typography>
            <Typography variant="h6" fontWeight={800} sx={{ color: "#fff" }}>
              {booking.destination}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ color: adminColors.textMuted }}>
            <CloseRounded />
          </IconButton>
        </Stack>

        <Chip
          label={bookingStatusLabels[statusKey] ?? booking.status}
          color={statusColor}
          size="small"
          sx={{ alignSelf: "flex-start", mb: 2, fontWeight: 700 }}
        />

        <Section title="Traveler info">
          {[
            ["Full name", booking.traveler?.fullName],
            ["Passport", booking.traveler?.passport],
            ["Email", booking.traveler?.email],
            ["Phone", booking.traveler?.phone],
          ].map(([label, val]) => (
            <Stack key={label} direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
              <Typography variant="caption" sx={{ color: adminColors.textMuted }}>
                {label}
              </Typography>
              <Typography variant="caption" sx={{ color: "#fff", fontWeight: 600 }}>
                {val}
              </Typography>
            </Stack>
          ))}
        </Section>

        <Section title="Trip details">
          <Typography variant="body2" sx={{ color: adminColors.textMuted }}>
            {booking.travelDates}
          </Typography>
          <Typography variant="body2" sx={{ color: "#fff", mt: 1 }}>
            {booking.travelers} traveler{booking.travelers > 1 ? "s" : ""}
          </Typography>
          <Typography variant="body2" sx={{ color: adminColors.textMuted, mt: 1, lineHeight: 1.6 }}>
            {booking.itinerarySummary}
          </Typography>
        </Section>

        <Section title="Payment">
          <Typography variant="body2" sx={{ color: adminColors.textMuted }}>
            {paymentLabels[booking.paymentMethod] ?? booking.paymentMethod}
          </Typography>
          <Typography variant="body2" sx={{ color: adminColors.textMuted, mt: 0.5 }}>
            {booking.paymentCardDisplay}
          </Typography>
          <Typography variant="h5" fontWeight={800} sx={{ color: adminColors.gold, mt: 1 }}>
            €{booking.amount?.toLocaleString()}
          </Typography>
          {booking.refundedAmount > 0 ? (
            <Typography variant="caption" sx={{ color: adminColors.textMuted, display: "block", mt: 0.5 }}>
              Refunded: €{booking.refundedAmount.toLocaleString()}
            </Typography>
          ) : null}
          <Typography variant="caption" sx={{ color: adminColors.textMuted, mt: 1, display: "block" }}>
            Invoice: {booking.invoice}
          </Typography>
        </Section>

        <ActivityTimeline title="Activity timeline" events={booking.timeline} />
        <AdminActionsHistory actions={booking.adminActions} />

        <Divider sx={{ borderColor: adminColors.border, my: 1 }} />

        <Typography variant="caption" sx={{ color: adminColors.textMuted, mb: 1.5, display: "block" }}>
          Destructive actions require confirmation and are logged automatically.
        </Typography>

        <Stack spacing={1}>
          {booking.status === "pending" ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<VerifiedRounded />}
              onClick={() => onApprove?.(booking)}
              sx={{ fontWeight: 700 }}
            >
              Approve
            </Button>
          ) : null}
          {canRefund ? (
            <Button
              variant="outlined"
              onClick={() => onRequestRefund?.(booking)}
              sx={{ borderColor: alpha("#60a5fa", 0.5), color: "#60a5fa", fontWeight: 600 }}
            >
              Refund
            </Button>
          ) : null}
          {canCancel ? (
            <Button
              variant="contained"
              color="error"
              onClick={() => onRequestCancel?.(booking)}
              sx={{ fontWeight: 700 }}
            >
              Cancel booking
            </Button>
          ) : null}
        </Stack>
      </Stack>
    </Drawer>
  );
}
