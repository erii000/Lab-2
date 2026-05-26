import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha, keyframes } from "@mui/material/styles";
import { useState } from "react";
import AppModal from "../../common/AppModal.jsx";
import { createContactTicket } from "../../../api/supportApi.js";
import { useToast } from "../../../context/ToastContext.jsx";
import { useAuthStore } from "../../../store/authStore.js";
import { designTokens } from "../../../theme/theme.js";

const successPop = keyframes`
  0% { transform: scale(0.85); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
`;

const initialForm = {
  fullName: "",
  email: "",
  bookingId: "",
  destination: "",
  travelDate: "",
};

export default function LostBookingRecoveryModal({ open, onClose }) {
  const { showToast } = useToast();
  const session = useAuthStore((s) => s.session);
  const [form, setForm] = useState(initialForm);
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleClose() {
    setSuccess(false);
    setForm(initialForm);
    setFile(null);
    onClose();
  }

  async function handleRecover(event) {
    event.preventDefault();
    if (!form.fullName.trim() || !form.email.trim() || !form.destination.trim() || !form.travelDate) {
      showToast({ message: "Please fill in name, email, destination, and travel date.", severity: "warning" });
      return;
    }
    setSubmitting(true);
    try {
      await createContactTicket(session?.accessToken, {
        subject: "Lost booking recovery",
        message: [
          `Destination: ${form.destination.trim()}`,
          `Travel date: ${form.travelDate}`,
          form.bookingId ? `Booking ref: ${form.bookingId}` : "",
          file ? `Attachment noted: ${file.name}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        priority: "high",
        tripType: "leisure",
      });
      setSuccess(true);
    } catch (err) {
      showToast({ message: err?.message ?? "Could not submit recovery request.", severity: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  function handleContactSupport() {
    showToast({ message: "Opening contact form — include any details you remember.", severity: "info" });
    handleClose();
    document.getElementById("contact-form")?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <AppModal
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      title={
        <Stack direction="row" spacing={1} alignItems="center">
          <SearchRoundedIcon sx={{ color: "primary.main", fontSize: 28 }} />
          <span>Recover Lost Booking</span>
        </Stack>
      }
      subtitle="Can't find your reservation? We'll help recover your booking details."
      actions={
        success ? (
          <Button variant="contained" onClick={handleClose} sx={{ fontWeight: 700 }}>
            Done
          </Button>
        ) : (
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} width="100%">
            <Button
              type="submit"
              form="lost-booking-form"
              variant="contained"
              color="primary"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
              sx={{ fontWeight: 800, flex: 1 }}
            >
              {submitting ? "Searching…" : "Recover Booking"}
            </Button>
            <Button variant="outlined" onClick={handleContactSupport} sx={{ fontWeight: 700, flex: 1 }}>
              Contact Support
            </Button>
          </Stack>
        )
      }
    >
      {success ? (
        <Stack alignItems="center" spacing={2} sx={{ py: 2, animation: `${successPop} 0.45s ease-out` }}>
          <CheckCircleRoundedIcon sx={{ fontSize: 64, color: "success.main" }} />
          <Typography variant="h6" fontWeight={800} textAlign="center">
            We found a possible match
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={360}>
            Our team will contact you shortly at {form.email} with your booking details.
          </Typography>
        </Stack>
      ) : (
        <Box component="form" id="lost-booking-form" onSubmit={handleRecover}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Full Name"
                fullWidth
                required
                size="small"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Email Address"
                type="email"
                fullWidth
                required
                size="small"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Booking ID (optional)"
                fullWidth
                size="small"
                value={form.bookingId}
                onChange={(e) => update("bookingId", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Travel Date"
                type="date"
                fullWidth
                required
                size="small"
                value={form.travelDate}
                onChange={(e) => update("travelDate", e.target.value)}
                InputLabelProps={{ shrink: true }}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Travel Destination"
                fullWidth
                required
                size="small"
                value={form.destination}
                onChange={(e) => update("destination", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Button component="label" variant="outlined" startIcon={<AttachFileRoundedIcon />} sx={{ fontWeight: 600 }}>
                Upload confirmation screenshot
                <input
                  type="file"
                  hidden
                  accept="image/*,.pdf"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </Button>
              {file ? (
                <Chip
                  label={file.name}
                  size="small"
                  onDelete={() => setFile(null)}
                  sx={{ ml: 1, bgcolor: alpha(designTokens.brand.navy, 0.3) }}
                />
              ) : null}
            </Grid>
          </Grid>
        </Box>
      )}
    </AppModal>
  );
}
