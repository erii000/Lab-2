import { CameraAltRounded, FlightRounded, HotelRounded, LocalActivityRounded, VerifiedRounded } from "../ui/icons.jsx";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Container,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import AppModal from "../components/common/AppModal.jsx";
import SectionHeading from "../components/common/SectionHeading.jsx";

const tabItems = [
  { label: "Flights", icon: <FlightRounded fontSize="small" /> },
  { label: "Hotels", icon: <HotelRounded fontSize="small" /> },
  { label: "Activities", icon: <LocalActivityRounded fontSize="small" /> },
];

export default function BookingPage() {
  const [tab, setTab] = useState(0);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <SectionHeading
        eyebrow="Optional scope"
        title="Booking"
        subtitle="Unified shell for inventory — hook BookingService when ready. Sorting and filters mirror Explore."
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Box sx={{ position: "relative", borderRadius: 2, overflow: "hidden" }}>
            <CardMedia
              component="img"
              image="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=80"
              height="180"
              alt=""
            />
            <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0.72))" }} />
            <Stack direction="row" spacing={1} alignItems="center" sx={{ position: "absolute", left: 14, bottom: 12 }}>
              <CameraAltRounded sx={{ color: "common.white" }} />
              <Typography sx={{ color: "common.white", fontWeight: 700 }}>
                Premium booking inventory
              </Typography>
            </Stack>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 2.2, height: "100%" }}>
            <Typography variant="subtitle2" sx={{ mb: 1.2, fontWeight: 700 }}>
              Trusted booking experience
            </Typography>
            <Stack spacing={1.1}>
              <Chip icon={<VerifiedRounded />} label="Verified providers only" variant="outlined" />
              <Chip icon={<FlightRounded />} label="Flight + hotel bundling" variant="outlined" />
              <Chip icon={<LocalActivityRounded />} label="Curated experiences" variant="outlined" />
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="fullWidth">
          {tabItems.map((t, i) => (
            <Tab key={t.label} icon={t.icon} iconPosition="start" label={t.label} value={i} />
          ))}
        </Tabs>
      </Paper>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack spacing={2}>
            {[1, 2, 3].map((i) => (
              <Card key={i} variant="outlined">
                <CardContent>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between">
                    <Box>
                      <Typography fontWeight={700}>
                        {tab === 0 && `Outbound option ${i}`}
                        {tab === 1 && `Boutique stay · Option ${i}`}
                        {tab === 2 && `Curated activity ${i}`}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Metadata row: duration, cancellation, ratings — populate from API.
                      </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight={800}>
                      €{180 + i * 40}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Sort by
            </Typography>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel id="sort-label">Sort</InputLabel>
              <Select labelId="sort-label" label="Sort" defaultValue="price">
                <MenuItem value="price">Price</MenuItem>
                <MenuItem value="rating">Rating</MenuItem>
                <MenuItem value="duration">Duration</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 3, position: "sticky", top: 96 }}>
            <Typography variant="h6" gutterBottom>
              Booking summary
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Mirrors checkout payloads your PaymentService expects.
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Selection</Typography>
                <Typography fontWeight={700}>€248</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Fees</Typography>
                <Typography fontWeight={700}>€14</Typography>
              </Stack>
            </Stack>
            <Button fullWidth variant="contained" color="secondary" sx={{ mt: 3 }} onClick={() => setCheckoutOpen(true)}>
              Proceed to payment
            </Button>
            <Button component={RouterLink} to="/itinerary" fullWidth sx={{ mt: 1 }}>
              Back to itinerary
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <AppModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        title="Confirm your booking"
        subtitle="Review your trip details before secure payment."
        actions={
          <>
            <Button onClick={() => setCheckoutOpen(false)}>Cancel</Button>
            <Button variant="contained" color="secondary" onClick={() => setCheckoutOpen(false)}>
              Pay now
            </Button>
          </>
        }
      >
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            You are booking <strong>Round-trip flight + boutique hotel</strong> for your selected itinerary dates.
          </Typography>
          <Stack spacing={0.8}>
            <Typography variant="body2" color="text.secondary">
              Traveler: 1 adult
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Included: cabin bag, hotel breakfast, free cancellation for 24 hours
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Payment method: card (3D Secure supported)
            </Typography>
          </Stack>
          <Divider />
          <Stack spacing={0.6}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Subtotal
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                €248
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Taxes & fees
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                €14
              </Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="subtitle2" color="text.secondary">
                Total
              </Typography>
              <Typography variant="subtitle1" fontWeight={800}>
                €262
              </Typography>
            </Stack>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            By continuing, you agree to provider terms and cancellation policy. A confirmation email will be sent after successful payment.
          </Typography>
        </Stack>
      </AppModal>
    </Container>
  );
}
