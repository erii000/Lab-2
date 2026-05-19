import { EmailOutlined, MapRounded, SendRounded } from "../ui/icons.jsx";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useState } from "react";
import SectionHeading from "../components/common/SectionHeading.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { designTokens } from "../theme/theme.js";

const contactChannels = [
  {
    icon: EmailOutlined,
    title: "Email",
    detail: "hello@smarttravel.app",
    note: "We reply within one business day.",
  },
  {
    icon: MapRounded,
    title: "Office",
    detail: "Rue de la Loi 16, Brussels",
    note: "Visits by appointment only.",
  },
];

export default function ContactPage() {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  function handleSubmit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      showToast({ message: "Please fill in all fields.", severity: "warning" });
      return;
    }
    showToast({
      message: "Thanks — your message was sent. Our team will get back to you soon.",
      severity: "success",
    });
    setForm({ name: "", email: "", message: "" });
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
      <SectionHeading
        eyebrow="Support"
        title="Contact us"
        subtitle="Questions about a trip, booking, or the platform? Reach out and we will help."
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {contactChannels.map((channel) => (
          <Grid key={channel.title} size={{ xs: 12, sm: 6 }}>
            <Paper
              sx={{
                p: 2.5,
                height: "100%",
                border: `1px solid ${alpha(designTokens.brand.gold, 0.15)}`,
                bgcolor: alpha(designTokens.brand.graphite, 0.35),
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: alpha(designTokens.brand.gold, 0.12),
                    color: "primary.main",
                  }}
                >
                  <channel.icon />
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {channel.title}
                  </Typography>
                  <Typography fontWeight={700}>{channel.detail}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {channel.note}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: { xs: 2, md: 3 },
          border: `1px solid ${alpha(designTokens.brand.gold, 0.18)}`,
        }}
      >
        <Typography variant="h6" fontWeight={800} gutterBottom>
          Send a message
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Your name"
              fullWidth
              size="small"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              size="small"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label="Message"
              fullWidth
              multiline
              minRows={4}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              startIcon={<SendRounded />}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              Send message
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
