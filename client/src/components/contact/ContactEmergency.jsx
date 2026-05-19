import FlightRoundedIcon from "@mui/icons-material/FlightRounded";
import PhoneInTalkRoundedIcon from "@mui/icons-material/PhoneInTalkRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { Box, Button, Grid, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useState } from "react";
import { designTokens } from "../../theme/theme.js";
import EmergencyHotlineModal from "./emergency/EmergencyHotlineModal.jsx";
import FlightAssistanceModal from "./emergency/FlightAssistanceModal.jsx";
import LostBookingRecoveryModal from "./emergency/LostBookingRecoveryModal.jsx";

export default function ContactEmergency() {
  const [hotlineOpen, setHotlineOpen] = useState(false);
  const [flightOpen, setFlightOpen] = useState(false);
  const [recoveryOpen, setRecoveryOpen] = useState(false);

  return (
    <>
      <Box
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 3,
          border: `1px solid ${alpha("#ef4444", 0.45)}`,
          background: `linear-gradient(135deg, ${alpha("#7f1d1d", 0.35)} 0%, ${alpha(designTokens.brand.charcoal, 0.95)} 55%)`,
          boxShadow: `0 20px 48px ${alpha("#000", 0.4)}`,
        }}
      >
        <Typography variant="overline" sx={{ color: "#fca5a5", fontWeight: 800, letterSpacing: "0.14em" }}>
          Emergency travel support
        </Typography>
        <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5, mb: 0.5 }}>
          Already traveling and need urgent help?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, maxWidth: 560 }}>
          24/7 priority line for missed connections, same-day changes, and lost bookings.
        </Typography>
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button
              fullWidth
              variant="contained"
              color="error"
              size="large"
              startIcon={<PhoneInTalkRoundedIcon />}
              onClick={() => setHotlineOpen(true)}
              sx={{ fontWeight: 800, py: 1.25 }}
            >
              Emergency Hotline
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<FlightRoundedIcon />}
              onClick={() => setFlightOpen(true)}
              sx={{
                fontWeight: 700,
                borderColor: alpha("#fca5a5", 0.5),
                color: "#fecaca",
                py: 1.25,
              }}
            >
              Flight Assistance
            </Button>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<SearchRoundedIcon />}
              onClick={() => setRecoveryOpen(true)}
              sx={{
                fontWeight: 700,
                borderColor: alpha(designTokens.brand.gold, 0.45),
                py: 1.25,
              }}
            >
              Lost Booking Recovery
            </Button>
          </Grid>
        </Grid>
      </Box>

      <EmergencyHotlineModal open={hotlineOpen} onClose={() => setHotlineOpen(false)} />
      <FlightAssistanceModal open={flightOpen} onClose={() => setFlightOpen(false)} />
      <LostBookingRecoveryModal open={recoveryOpen} onClose={() => setRecoveryOpen(false)} />
    </>
  );
}
