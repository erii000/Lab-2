import FlightRoundedIcon from "@mui/icons-material/FlightRounded";
import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import AppModal from "../../common/AppModal.jsx";
import { useToast } from "../../../context/ToastContext.jsx";
import { designTokens } from "../../../theme/theme.js";

const ISSUE_TYPES = ["Delay", "Cancellation", "Missed Connection", "Rebooking", "Other"];

const initialForm = {
  bookingReference: "",
  airlineName: "",
  flightNumber: "",
  issueType: "Delay",
  description: "",
};

export default function FlightAssistanceModal({ open, onClose }) {
  const { showToast } = useToast();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.bookingReference.trim() || !form.description.trim()) {
      showToast({ message: "Booking reference and issue description are required.", severity: "warning" });
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSubmitting(false);
    showToast({ message: "Flight assistance request submitted. An agent will follow up shortly.", severity: "success" });
    setForm(initialForm);
    onClose();
  }

  return (
    <AppModal
      open={open}
      onClose={onClose}
      maxWidth="sm"
      title={
        <Stack direction="row" spacing={1} alignItems="center">
          <FlightRoundedIcon sx={{ color: "primary.main", fontSize: 28 }} />
          <span>Flight Assistance</span>
        </Stack>
      }
      subtitle="Manage delays, missed connections, rebooking, and same-day flight changes."
      actions={
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} width="100%">
          <Button
            type="submit"
            form="flight-assistance-form"
            variant="contained"
            color="primary"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
            sx={{ fontWeight: 800, flex: 1 }}
          >
            {submitting ? "Submitting…" : "Submit Request"}
          </Button>
          <Button
            component={RouterLink}
            to="/assistant"
            variant="outlined"
            startIcon={<SupportAgentRoundedIcon />}
            onClick={onClose}
            sx={{ fontWeight: 700, flex: 1 }}
          >
            Talk to an Agent
          </Button>
        </Stack>
      }
    >
      <Box component="form" id="flight-assistance-form" onSubmit={handleSubmit}>
        <Chip
          label="Priority response for active travelers"
          size="small"
          sx={{
            mb: 2,
            fontWeight: 700,
            bgcolor: alpha(designTokens.brand.gold, 0.15),
            border: `1px solid ${alpha(designTokens.brand.gold, 0.35)}`,
          }}
        />
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Booking Reference"
              fullWidth
              required
              size="small"
              value={form.bookingReference}
              onChange={(e) => update("bookingReference", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Flight Number"
              fullWidth
              size="small"
              value={form.flightNumber}
              onChange={(e) => update("flightNumber", e.target.value)}
              placeholder="e.g. LH1234"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Airline Name"
              fullWidth
              size="small"
              value={form.airlineName}
              onChange={(e) => update("airlineName", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControl fullWidth size="small">
              <InputLabel shrink>Issue Type</InputLabel>
              <Select
                value={form.issueType}
                label="Issue Type"
                onChange={(e) => update("issueType", e.target.value)}
                notched
              >
                {ISSUE_TYPES.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Describe your issue"
              fullWidth
              required
              multiline
              minRows={4}
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Box>
    </AppModal>
  );
}
