import { CameraAltRounded, ExpandMoreRounded, SpaRounded, VerifiedRounded } from "../ui/icons.jsx";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  CardMedia,
  Chip,
  Container,
  Grid,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import SectionHeading from "../components/common/SectionHeading.jsx";

const faqs = [
  {
    q: "What is the primary user journey?",
    a: "Home → Explore → Destination detail → Itinerary planner → Save or Book. Navigation and CTAs in this shell follow that sequence.",
  },
  {
    q: "Where does AI plug in?",
    a: "The Assistant page streams conversations; itinerary blocks can receive structured JSON from your LLM layer. Prefer tool calls into ItineraryService for persistence.",
  },
  {
    q: "How optional is booking?",
    a: "Booking tabs and payment modal are scoped as optional — ship discovery + itinerary first if timeline is tight.",
  },
];

export default function AboutHelpPage() {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
      <SectionHeading
        eyebrow="About"
        title="How Smart Travel Assistant works"
        subtitle="Share this page with stakeholders — it encodes scope boundaries and integration seams for your microservices."
      />

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 7 }}>
          <Box sx={{ position: "relative", borderRadius: 2, overflow: "hidden" }}>
            <CardMedia
              component="img"
              image="https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80"
              height="180"
              alt=""
            />
            <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.12), rgba(0,0,0,0.72))" }} />
            <Stack direction="row" spacing={1} alignItems="center" sx={{ position: "absolute", left: 12, bottom: 12 }}>
              <CameraAltRounded sx={{ color: "common.white" }} />
              <Typography sx={{ color: "common.white", fontWeight: 700 }}>
                Built to make travel planning exciting
              </Typography>
            </Stack>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 2.2, height: "100%" }}>
            <Typography variant="subtitle2" sx={{ mb: 1.2, fontWeight: 700 }}>
              Why users enjoy this app
            </Typography>
            <Stack spacing={1.1}>
              <Chip icon={<SpaRounded />} label="Beautiful curated destinations" variant="outlined" />
              <Chip icon={<VerifiedRounded />} label="Clear trusted journey flow" variant="outlined" />
              <Chip icon={<ExpandMoreRounded />} label="Helpful FAQ and support" variant="outlined" />
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ p: { xs: 2, md: 4 }, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Platform overview
        </Typography>
        <Typography color="text.secondary" paragraph>
          Users discover places on Explore, deepen context on Destination, then compile a day-by-day plan in the itinerary
          planner. The AI assistant accelerates planning with natural language; booking is optional once inventory is
          connected.
        </Typography>
        <Typography color="text.secondary">
          Backend links to consider: ApiGateway routes, UserService auth, ItineraryService CRUD, BookingService quotes,
          PaymentService checkout, WeatherExternalDataService for destination cards.
        </Typography>
      </Paper>

      <Typography variant="h6" gutterBottom sx={{ mb: 1 }}>
        FAQ
      </Typography>
      <Stack spacing={1} sx={{ mb: 5 }}>
        {faqs.map((item) => (
          <Accordion key={item.q} disableGutters elevation={0} sx={{ border: (t) => `1px solid ${t.palette.divider}`, borderRadius: 1, '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreRounded />}>
              <Typography fontWeight={700}>{item.q}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">{item.a}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Support
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Point production support at your ticketing system. For development, see repository docs and{" "}
          <Link component={RouterLink} to="/assistant">
            Assistant
          </Link>{" "}
          /{" "}
          <Link component={RouterLink} to="/itinerary">
            Itinerary
          </Link>{" "}
          flows first.
        </Typography>
      </Paper>
    </Container>
  );
}
