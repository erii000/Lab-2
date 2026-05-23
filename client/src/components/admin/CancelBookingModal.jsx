import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import AppModal from "../common/AppModal.jsx";
import { adminColors, adminPanelSx } from "./adminStyles.js";
import { CANCEL_REASONS } from "../../utils/adminBookingActivity.js";

export default function CancelBookingModal({ open, booking, onClose, onConfirm }) {
  const [reason, setReason] = useState(CANCEL_REASONS[0]);
  const [notes, setNotes] = useState("");
  const [issueRefund, setIssueRefund] = useState(false);
  const [refundAmount, setRefundAmount] = useState(0);

  useEffect(() => {
    if (!open || !booking) return;
    setReason(CANCEL_REASONS[0]);
    setNotes("");
    setIssueRefund(false);
    setRefundAmount(booking.amount ?? 0);
  }, [open, booking]);

  if (!booking) return null;

  const canConfirm = reason !== "Other" || notes.trim().length > 0;

  function handleConfirm() {
    onConfirm?.({
      reason,
      notes: reason === "Other" ? notes.trim() : notes.trim() || undefined,
      issueRefund,
      refundAmount: issueRefund ? Number(refundAmount) || 0 : 0,
    });
  }

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Cancel booking"
      subtitle="You are about to cancel this reservation. This action may affect the traveler's trip and payment."
      maxWidth="sm"
      actions={
        <>
          <Button onClick={onClose} sx={{ color: adminColors.textMuted, fontWeight: 600 }}>
            Back
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={!canConfirm}
            onClick={handleConfirm}
            sx={{ fontWeight: 700, px: 3 }}
          >
            Cancel booking
          </Button>
        </>
      }
    >
      <Stack spacing={2.5}>
        <Box sx={{ ...adminPanelSx, p: 2 }}>
          <Typography variant="overline" sx={{ color: adminColors.gold, fontWeight: 800, letterSpacing: "0.08em" }}>
            Booking summary
          </Typography>
          {[
            ["Booking ID", booking.id],
            ["Traveler", booking.user],
            ["Destination", booking.destination],
            ["Travel dates", booking.travelDates],
            ["Amount paid", `€${booking.amount?.toLocaleString()}`],
          ].map(([label, value]) => (
            <Stack key={label} direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
              <Typography variant="body2" sx={{ color: adminColors.textMuted }}>
                {label}
              </Typography>
              <Typography variant="body2" sx={{ color: "#fff", fontWeight: 600 }}>
                {value}
              </Typography>
            </Stack>
          ))}
        </Box>

        <FormControl fullWidth>
          <InputLabel shrink>Reason for cancellation</InputLabel>
          <Select label="Reason for cancellation" value={reason} onChange={(e) => setReason(e.target.value)} notched>
            {CANCEL_REASONS.map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {reason === "Other" ? (
          <TextField
            label="Add notes"
            fullWidth
            multiline
            minRows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            required
            InputLabelProps={{ shrink: true }}
          />
        ) : (
          <TextField
            label="Additional notes (optional)"
            fullWidth
            multiline
            minRows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        )}

        <Box sx={{ ...adminPanelSx, p: 2 }}>
          <FormControlLabel
            control={<Checkbox checked={issueRefund} onChange={(e) => setIssueRefund(e.target.checked)} />}
            label={
              <Typography variant="body2" sx={{ color: "#fff", fontWeight: 600 }}>
                Issue refund to traveler
              </Typography>
            }
          />
          {issueRefund ? (
            <TextField
              label="Refund amount (€)"
              type="number"
              fullWidth
              size="small"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              sx={{ mt: 1.5 }}
              InputLabelProps={{ shrink: true }}
              helperText={`Maximum €${booking.amount?.toLocaleString()}`}
            />
          ) : null}
        </Box>

        <Typography variant="caption" sx={{ color: adminColors.textMuted, lineHeight: 1.5 }}>
          The traveler will be notified automatically after you confirm. Status will update to{" "}
          <strong style={{ color: adminColors.gold }}>Cancelled</strong>.
        </Typography>
      </Stack>
    </AppModal>
  );
}
