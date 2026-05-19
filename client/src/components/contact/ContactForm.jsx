import AttachFileRoundedIcon from "@mui/icons-material/AttachFileRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CloudDoneOutlinedIcon from "@mui/icons-material/CloudDoneOutlined";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha, keyframes } from "@mui/material/styles";
import { useCallback, useEffect, useRef, useState } from "react";
import { clearContactDraft, loadContactDraft, saveContactDraft } from "../../utils/contactFormStorage.js";
import { designTokens } from "../../theme/theme.js";
import { glassCard } from "./contactStyles.js";
import { validateContactField, validateContactForm } from "./contactFormValidation.js";

const successPop = keyframes`
  0% { transform: scale(0.6); opacity: 0; }
  60% { transform: scale(1.08); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
`;

const TRIP_TYPES = [
  { value: "leisure", label: "Leisure" },
  { value: "business", label: "Business" },
  { value: "family", label: "Family" },
  { value: "luxury", label: "Luxury" },
  { value: "group", label: "Group" },
];

const PRIORITIES = [
  { value: "standard", label: "Standard" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

const MAX_FILES = 3;
const MAX_FILE_MB = 5;

export default function ContactForm({ formRef, lightSurface }) {
  const [form, setForm] = useState(loadContactDraft);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const saveTimer = useRef(null);

  const showError = (field) => Boolean(touched[field] && errors[field]);

  const updateField = useCallback((field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      return next;
    });
    setTouched((t) => ({ ...t, [field]: true }));
  }, []);

  useEffect(() => {
    const err = validateContactField;
    setErrors((prev) => {
      const next = { ...prev };
      Object.keys(form).forEach((key) => {
        if (touched[key]) next[key] = err(key, form[key]);
      });
      return next;
    });
  }, [form, touched]);

  const draftChipTimer = useRef(null);

  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      saveContactDraft(form);
      setDraftSaved(true);
      if (draftChipTimer.current) clearTimeout(draftChipTimer.current);
      draftChipTimer.current = setTimeout(() => setDraftSaved(false), 2000);
    }, 500);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [form]);

  function handleBlur(field) {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((e) => ({ ...e, [field]: validateContactField(field, form[field]) }));
  }

  function handleFiles(event) {
    const picked = [...(event.target.files ?? [])];
    const valid = [];
    for (const file of picked) {
      if (file.size > MAX_FILE_MB * 1024 * 1024) continue;
      valid.push(file);
    }
    setFiles((prev) => [...prev, ...valid].slice(0, MAX_FILES));
    event.target.value = "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const allTouched = Object.keys(form).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    setTouched(allTouched);
    const nextErrors = validateContactForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1400));
    setSubmitting(false);
    setSuccess(true);
    clearContactDraft();
    setTimeout(() => {
      setSuccess(false);
      setForm(loadContactDraft());
      setTouched({});
      setErrors({});
      setFiles([]);
    }, 2800);
  }

  return (
    <Paper
      ref={formRef}
      id="contact-form"
      component="form"
      onSubmit={handleSubmit}
      elevation={0}
      sx={(theme) => ({
        ...glassCard(theme, { light: lightSurface }),
        p: { xs: 2.5, md: 3.5 },
        position: "relative",
        overflow: "hidden",
        "&:hover": success ? {} : undefined,
      })}
    >
      {success ? (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            display: "grid",
            placeItems: "center",
            bgcolor: alpha(designTokens.brand.obsidian, 0.88),
            backdropFilter: "blur(8px)",
          }}
        >
          <Stack alignItems="center" spacing={1.5} sx={{ animation: `${successPop} 0.55s ease-out` }}>
            <CheckCircleRoundedIcon sx={{ fontSize: 72, color: "success.main" }} />
            <Typography variant="h5" fontWeight={800}>
              Message sent
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={280}>
              Our travel specialists will reply shortly. Reference emails are typically sent within minutes.
            </Typography>
          </Stack>
        </Box>
      ) : null}

      <Collapse in={draftSaved}>
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Chip
            size="small"
            icon={<CloudDoneOutlinedIcon sx={{ fontSize: 16 }} />}
            label="Draft saved"
            sx={{ fontWeight: 600, bgcolor: alpha(designTokens.brand.navy, 0.35) }}
          />
        </Box>
      </Collapse>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Full Name"
            fullWidth
            required
            value={form.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            onBlur={() => handleBlur("fullName")}
            error={showError("fullName")}
            helperText={showError("fullName") ? errors.fullName : " "}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            error={showError("email")}
            helperText={showError("email") ? errors.email : " "}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Subject"
            fullWidth
            required
            value={form.subject}
            onChange={(e) => updateField("subject", e.target.value)}
            onBlur={() => handleBlur("subject")}
            error={showError("subject")}
            helperText={showError("subject") ? errors.subject : " "}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            label="Booking ID (optional)"
            fullWidth
            value={form.bookingId}
            onChange={(e) => updateField("bookingId", e.target.value)}
            onBlur={() => handleBlur("bookingId")}
            placeholder="e.g. bk_abc123"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small">
            <InputLabel shrink>Trip Type</InputLabel>
            <Select
              value={form.tripType}
              label="Trip Type"
              onChange={(e) => updateField("tripType", e.target.value)}
              notched
            >
              {TRIP_TYPES.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small">
            <InputLabel shrink>Priority level</InputLabel>
            <Select
              value={form.priority}
              label="Priority level"
              onChange={(e) => updateField("priority", e.target.value)}
              notched
            >
              {PRIORITIES.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            label="Message"
            fullWidth
            required
            multiline
            minRows={5}
            value={form.message}
            onChange={(e) => updateField("message", e.target.value)}
            onBlur={() => handleBlur("message")}
            error={showError("message")}
            helperText={showError("message") ? errors.message : "Describe your trip or issue in detail"}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Button component="label" variant="outlined" startIcon={<AttachFileRoundedIcon />} sx={{ fontWeight: 600 }}>
            Attach tickets or screenshots
            <input type="file" hidden multiple accept="image/*,.pdf" onChange={handleFiles} />
          </Button>
          <FormHelperText sx={{ mt: 0.5 }}>
            Up to {MAX_FILES} files, {MAX_FILE_MB}MB each (images or PDF)
          </FormHelperText>
          {files.length > 0 ? (
            <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 1 }}>
              {files.map((f) => (
                <Chip key={f.name + f.size} label={f.name} size="small" onDelete={() => setFiles((prev) => prev.filter((x) => x !== f))} />
              ))}
            </Stack>
          ) : null}
        </Grid>
        <Grid size={{ xs: 12 }}>
          <Box sx={{ display: "flex", justifyContent: "center", pt: 0.5 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={submitting || success}
              startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SendRoundedIcon />}
              sx={{
                fontWeight: 800,
                px: 5,
                minWidth: 220,
                background: `linear-gradient(135deg, ${designTokens.brand.gold}, ${alpha(designTokens.brand.gold, 0.88)})`,
                color: designTokens.brand.obsidian,
              }}
            >
              {submitting ? "Sending…" : "Send Message"}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
