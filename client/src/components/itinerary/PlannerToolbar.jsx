import { ShareRounded } from "../../ui/icons.jsx";
import { Box, Button, Container, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { buildBookingUrl } from "../../utils/destinationSearch.js";
import { designTokens } from "../../theme/theme.js";

export default function PlannerToolbar({
  tripTitle,
  destinationId,
  tripParams,
  onSave,
  onContinueToBooking,
}) {
  const navigate = useNavigate();

  function handleContinue() {
    const booking = onContinueToBooking?.();
    navigate(
      buildBookingUrl(destinationId, {
        bookingId: booking?.id,
        start: tripParams.start,
        end: tripParams.end,
        guests: tripParams.travelers,
        budget: tripParams.budget,
      }),
    );
  }

  return (
    <Box
      sx={{
        borderBottom: `1px solid ${alpha(designTokens.brand.gold, 0.1)}`,
        bgcolor: alpha(designTokens.brand.obsidian, 0.95),
      }}
    >
      <Container maxWidth="xl">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ py: 1.5, minHeight: 56 }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
            Trip editor
          </Typography>
          <Typography variant="subtitle1" fontWeight={800} sx={{ letterSpacing: "-0.02em" }}>
            {tripTitle}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="text" onClick={onSave} sx={{ fontWeight: 600, color: "text.secondary" }}>
              Save
            </Button>
            <Button
              size="small"
              variant="text"
              startIcon={<ShareRounded sx={{ fontSize: 16 }} />}
              onClick={() => {
                if (navigator.share) navigator.share({ title: tripTitle, url: window.location.href });
                else navigator.clipboard?.writeText(window.location.href);
              }}
              sx={{ fontWeight: 600, color: "text.secondary" }}
            >
              Share
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={handleContinue}
              sx={{ fontWeight: 700, display: { xs: "none", sm: "inline-flex" } }}
            >
              Continue to booking
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
