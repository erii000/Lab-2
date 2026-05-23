import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import AppModal from "../common/AppModal.jsx";
import { adminColors, adminPanelSx } from "./adminStyles.js";
import { REFUND_REASONS } from "../../utils/adminBookingActivity.js";

export default function RefundBookingModal({ open, booking, onClose, onConfirm }) {
  const [refundType, setRefundType] = useState("full");
  const [refundAmount, setRefundAmount] = useState(0);
  const [reason, setReason] = useState(REFUND_REASONS[0]);
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!open || !booking) return;
    setRefundType("full");
    setRefundAmount(booking.amount ?? 0);
    setReason(REFUND_REASONS[0]);
    setNote("");
  }, [open, booking]);

  if (!booking) return null;

  const maxRefund = booking.amount ?? 0;
  const amount = refundType === "full" ? maxRefund : Number(refundAmount) || 0;
  const valid = amount > 0 && amount <= maxRefund;

  function handleConfirm() {
    onConfirm?.({
      refundType,
      refundAmount: amount,
      reason,
      note: note.trim() || undefined,
    });
  }

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Refund booking"
      subtitle="Choose the refund amount and confirm."
      maxWidth="sm"
      actions={
        <>
          <Button onClick={onClose} sx={{ color: adminColors.textMuted, fontWeight: 600 }}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" disabled={!valid} onClick={handleConfirm} sx={{ fontWeight: 700, px: 3 }}>
            Confirm refund
          </Button>
        </>
      }
    >
      <Stack spacing={2.5}>
        <Box sx={{ ...adminPanelSx, p: 2 }}>
          <Typography variant="overline" sx={{ color: adminColors.gold, fontWeight: 800 }}>
            Payment summary
          </Typography>
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.5 }}>
            <Typography variant="body2" sx={{ color: adminColors.textMuted }}>
              Total paid
            </Typography>
            <Typography variant="body1" fontWeight={800} sx={{ color: adminColors.gold }}>
              €{maxRefund.toLocaleString()}
            </Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.75 }}>
            <Typography variant="body2" sx={{ color: adminColors.textMuted }}>
              Payment method
            </Typography>
            <Typography variant="body2" sx={{ color: "#fff", fontWeight: 600 }}>
              {booking.paymentCardDisplay}
            </Typography>
          </Stack>
        </Box>

        <FormControl>
          <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#fff", mb: 1 }}>
            Refund type
          </Typography>
          <RadioGroup value={refundType} onChange={(e) => setRefundType(e.target.value)}>
            <FormControlLabel
              value="full"
              control={<Radio />}
              label={<Typography sx={{ color: adminColors.textMuted }}>Full refund</Typography>}
            />
            <FormControlLabel
              value="partial"
              control={<Radio />}
              label={<Typography sx={{ color: adminColors.textMuted }}>Partial refund</Typography>}
            />
          </RadioGroup>
        </FormControl>

        {refundType === "partial" ? (
          <TextField
            label="Refund amount (€)"
            type="number"
            fullWidth
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
            InputLabelProps={{ shrink: true }}
            helperText={`Max €${maxRefund.toLocaleString()}`}
          />
        ) : (
          <Typography variant="body2" sx={{ color: adminColors.textMuted }}>
            Refund amount: <strong style={{ color: "#fff" }}>€{maxRefund.toLocaleString()}</strong>
          </Typography>
        )}

        <FormControl fullWidth>
          <InputLabel shrink>Reason</InputLabel>
          <Select label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} notched>
            {REFUND_REASONS.map((r) => (
              <MenuItem key={r} value={r}>
                {r}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Internal note"
          fullWidth
          multiline
          minRows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Optional note for your team"
          InputLabelProps={{ shrink: true }}
        />

        <Typography variant="caption" sx={{ color: adminColors.textMuted }}>
          Status will update to {refundType === "full" ? "Refunded" : "Partially refunded"}. Traveler notification
          sent automatically.
        </Typography>
      </Stack>
    </AppModal>
  );
}
