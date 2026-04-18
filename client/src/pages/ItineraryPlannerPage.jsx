import {
  AddRounded,
  AutoAwesomeRounded,
  CameraAltRounded,
  DragIndicatorRounded,
  EditRounded,
  RestaurantRounded,
  DeleteOutlineRounded,
  VerifiedRounded,
} from "../ui/icons.jsx";
import {
  Box,
  Button,
  CardMedia,
  Chip,
  Container,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import SectionHeading from "../components/common/SectionHeading.jsx";

const demoDays = [
  {
    day: 1,
    label: "Arrival & orientation",
    activities: [
      { id: "a1", title: "Airport transfer", cost: 35, time: "14:00" },
      { id: "a2", title: "Historic quarter walk", cost: 0, time: "16:30" },
      { id: "a3", title: "Welcome dinner reservation", cost: 48, time: "19:30" },
    ],
  },
  {
    day: 2,
    label: "Signature experiences",
    activities: [
      { id: "b1", title: "Guided museum visit", cost: 22, time: "10:00" },
      { id: "b2", title: "Coastal viewpoint", cost: 12, time: "15:00" },
    ],
  },
];

export default function ItineraryPlannerPage() {
  const total = demoDays.flatMap((d) => d.activities).reduce((s, a) => s + a.cost, 0);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <SectionHeading
        eyebrow="Core feature"
        title="Itinerary planner"
        subtitle="Timeline + drag targets (swap in @dnd-kit or similar). AI suggestions slot into the toolbar."
        action={
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <Button variant="outlined" component={RouterLink} to="/assistant" startIcon={<AutoAwesomeRounded />}>
              Get AI suggestions
            </Button>
            <Button variant="contained" color="secondary" component={RouterLink} to="/booking">
              Review & book
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Box sx={{ position: "relative", borderRadius: 2, overflow: "hidden" }}>
            <CardMedia
              component="img"
              image="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80"
              height="180"
              alt=""
            />
            <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.72))" }} />
            <Stack direction="row" spacing={1} alignItems="center" sx={{ position: "absolute", left: 14, bottom: 12 }}>
              <CameraAltRounded sx={{ color: "common.white" }} />
              <Typography sx={{ color: "common.white", fontWeight: 700 }}>
                Trip inspiration board
              </Typography>
            </Stack>
          </Box>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper sx={{ p: 2.2, height: "100%" }}>
            <Typography variant="subtitle2" sx={{ mb: 1.3, fontWeight: 700 }}>
              Smart planning boosters
            </Typography>
            <Stack spacing={1.1}>
              <Chip icon={<RestaurantRounded />} label="Food route suggestions" variant="outlined" />
              <Chip icon={<VerifiedRounded />} label="Optimized day balance" variant="outlined" />
              <Chip icon={<AutoAwesomeRounded />} label="AI auto-fill activities" variant="outlined" />
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Stack spacing={3}>
            {demoDays.map((day) => (
              <Paper key={day.day} sx={{ p: 2, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="overline" color="secondary">
                      Day {day.day}
                    </Typography>
                    <Typography variant="h6">{day.label}</Typography>
                  </Box>
                  <Button size="small" startIcon={<AddRounded />}>
                    Add activity
                  </Button>
                </Stack>
                <Divider sx={{ mb: 1 }} />
                <List disablePadding>
                  {day.activities.map((act) => (
                    <ListItem
                      key={act.id}
                      sx={{
                        borderRadius: 1,
                        mb: 1,
                        bgcolor: alpha("#0f172a", 0.03),
                        alignItems: "stretch",
                      }}
                      secondaryAction={
                        <Stack direction="row" spacing={0.5}>
                          <Tooltip title="Edit">
                            <IconButton edge="end" aria-label="edit">
                              <EditRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remove">
                            <IconButton edge="end" aria-label="remove">
                              <DeleteOutlineRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      }
                    >
                      <DragIndicatorRounded
                        sx={{
                          mr: 1,
                          alignSelf: "center",
                          color: "text.disabled",
                          cursor: "grab",
                        }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={700}>{act.title}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {act.time} · €{act.cost}
                        </Typography>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            ))}
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: "block" }}>
            Drag handles are visual placeholders — wire your DnD library to reorder within/across days.
          </Typography>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper sx={{ p: 3, borderRadius: 2, position: "sticky", top: 96 }}>
            <Typography variant="h6" gutterBottom>
              Trip summary
            </Typography>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Activities subtotal</Typography>
                <Typography fontWeight={700}>€{total}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography color="text.secondary">Taxes & fees (est.)</Typography>
                <Typography fontWeight={700}>€12</Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Typography fontWeight={800}>Estimated total</Typography>
                <Typography fontWeight={800} color="secondary.main">
                  €{total + 12}
                </Typography>
              </Stack>
            </Stack>
            <Chip label="Live pricing: connect Booking / Payment services" sx={{ mt: 2 }} variant="outlined" />
            <Button component={RouterLink} to="/booking" fullWidth variant="contained" color="secondary" sx={{ mt: 3 }}>
              Continue to booking
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
