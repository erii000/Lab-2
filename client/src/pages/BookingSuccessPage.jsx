import { AutoAwesomeRounded, VerifiedRounded } from "../ui/icons.jsx";
import {
  Box,
  Button,
  Container,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink, useLocation, useParams } from "react-router-dom";
import SectionHeading from "../components/common/SectionHeading.jsx";
import { useBookingStore } from "../store/bookingStore.js";
import { formatBookingDates } from "../utils/bookingFactory.js";
import { designTokens } from "../theme/theme.js";

export default function BookingSuccessPage() {
  const { bookingId } = useParams();
  const location = useLocation();
  const getBookingById = useBookingStore((s) => s.getBookingById);
  const booking = getBookingById(bookingId);
  const reference = location.state?.reference ?? booking?.bookingReference ?? bookingId;

  if (!booking) {
    return (
      <Container sx={{ py: 8 }}>
        <Typography variant="h5">Confirmation not found</Typography>
        <Button component={RouterLink} to="/bookings" sx={{ mt: 2 }}>
          Bookings
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, md: 6 } }}>
      <Paper
        sx={{
          p: { xs: 3, md: 4 },
          textAlign: "center",
          border: `1px solid ${alpha(designTokens.brand.gold, 0.3)}`,
          background: `linear-gradient(180deg, ${alpha(designTokens.brand.navy, 0.25)} 0%, ${alpha(designTokens.brand.obsidian, 0.95)} 100%)`,
        }}
      >
        <VerifiedRounded sx={{ fontSize: 56, color: "success.light", mb: 1 }} />
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Trip confirmed
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          {booking.packageTitle} · {formatBookingDates(booking)}
        </Typography>

        <Stack spacing={1.5} sx={{ textAlign: "left", mb: 3 }}>
          <Row label="Booking ID" value={reference} />
          <Row label="Destination" value={booking.destinationTitle} />
          <Row label="Total paid" value={`€${booking.total.toLocaleString()}`} />
        </Stack>

        {booking.itinerary?.length ? (
          <Box sx={{ textAlign: "left", mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={800} gutterBottom>
              Itinerary preview
            </Typography>
            <List dense disablePadding>
              {booking.itinerary.slice(0, 3).map((day) => (
                <ListItem key={day.day} disableGutters sx={{ py: 0.35 }}>
                  <ListItemText
                    primary={`Day ${day.day}: ${day.title}`}
                    secondary={day.items?.[0]}
                    primaryTypographyProps={{ variant: "body2", fontWeight: 600 }}
                    secondaryTypographyProps={{ variant: "caption" }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        ) : null}

        <Divider sx={{ my: 2 }} />

        <Stack spacing={1}>
          <Button variant="outlined" fullWidth disabled sx={{ justifyContent: "flex-start" }}>
            Download receipt (PDF)
          </Button>
          <Button variant="outlined" fullWidth disabled sx={{ justifyContent: "flex-start" }}>
            Add to calendar
          </Button>
          <Button
            component={RouterLink}
            to="/bookings"
            variant="contained"
            color="secondary"
            fullWidth
            startIcon={<AutoAwesomeRounded />}
            sx={{ fontWeight: 800, mt: 1 }}
          >
            Manage in Bookings
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}

function Row({ label, value }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700}>
        {value}
      </Typography>
    </Stack>
  );
}
