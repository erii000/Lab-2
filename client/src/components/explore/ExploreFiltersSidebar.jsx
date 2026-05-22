import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Slider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { ExpandMoreRounded } from "../../ui/icons.jsx";
import { designTokens } from "../../theme/theme.js";

const tripTypes = ["Adventure", "Relaxing", "City", "Nature", "Food", "Culture"];
const experiences = [
  { value: "", label: "Any style" },
  { value: "romantic", label: "Romantic" },
  { value: "beach", label: "Beach escape" },
  { value: "luxury", label: "Luxury" },
  { value: "family", label: "Family" },
  { value: "adventure", label: "Adventure" },
];

export default function ExploreFiltersSidebar({ filters, onChange }) {
  function set(patch) {
    onChange({ ...filters, ...patch });
  }

  return (
    <Box
      sx={{
        position: { md: "sticky" },
        top: { md: 160 },
        pr: { md: 2 },
      }}
    >
      <Typography variant="overline" color="text.secondary" fontWeight={800} sx={{ letterSpacing: "0.1em", mb: 1.5, display: "block" }}>
        Filters
      </Typography>

      <Stack spacing={0.5}>
        {[
          {
            id: "destination",
            title: "Destination",
            content: (
              <TextField
                size="small"
                fullWidth
                placeholder="City or region"
                value={filters.destination}
                onChange={(e) => set({ destination: e.target.value })}
              />
            ),
          },
          {
            id: "budget",
            title: "Budget",
            content: (
              <Box>
                <Slider
                  value={filters.budget ?? 2000}
                  min={300}
                  max={5000}
                  step={50}
                  valueLabelDisplay="auto"
                  onChange={(_, v) => set({ budget: v })}
                />
                <Typography variant="body2" fontWeight={600}>
                  Up to €{filters.budget ?? 2000}
                </Typography>
              </Box>
            ),
          },
          {
            id: "dates",
            title: "Dates",
            content: (
              <Stack spacing={1.5}>
                <TextField
                  type="date"
                  label="Check-in"
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={filters.start}
                  onChange={(e) => set({ start: e.target.value })}
                />
                <TextField
                  type="date"
                  label="Check-out"
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={filters.end}
                  onChange={(e) => set({ end: e.target.value })}
                />
              </Stack>
            ),
          },
          {
            id: "travelers",
            title: "Travelers",
            content: (
              <TextField
                type="number"
                size="small"
                fullWidth
                inputProps={{ min: 1, max: 12 }}
                value={filters.travelers}
                onChange={(e) => set({ travelers: Number(e.target.value) || 1 })}
              />
            ),
          },
          {
            id: "tripType",
            title: "Trip type",
            content: (
              <FormControl fullWidth size="small">
                <InputLabel>Trip type</InputLabel>
                <Select
                  label="Trip type"
                  value={filters.tripType}
                  onChange={(e) => set({ tripType: e.target.value })}
                >
                  <MenuItem value="">Any</MenuItem>
                  {tripTypes.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ),
          },
          {
            id: "experience",
            title: "Experience style",
            content: (
              <FormControl fullWidth size="small">
                <InputLabel>Style</InputLabel>
                <Select
                  label="Style"
                  value={filters.experience}
                  onChange={(e) => set({ experience: e.target.value })}
                >
                  {experiences.map((x) => (
                    <MenuItem key={x.value} value={x.value}>
                      {x.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ),
          },
          {
            id: "weather",
            title: "Weather",
            content: (
              <FormControl fullWidth size="small">
                <InputLabel>Weather</InputLabel>
                <Select
                  label="Weather"
                  value={filters.weather}
                  onChange={(e) => set({ weather: e.target.value })}
                >
                  <MenuItem value="">Any</MenuItem>
                  <MenuItem value="warm">Warm (20°C+)</MenuItem>
                  <MenuItem value="mild">Mild</MenuItem>
                </Select>
              </FormControl>
            ),
          },
          {
            id: "activities",
            title: "Activities",
            content: (
              <TextField
                size="small"
                fullWidth
                placeholder="e.g. Food, Culture"
                value={filters.activities}
                onChange={(e) => set({ activities: e.target.value })}
              />
            ),
          },
        ].map((section, i) => (
          <Accordion
            key={section.id}
            disableGutters
            elevation={0}
            defaultExpanded={i < 3}
            sx={{
              bgcolor: "transparent",
              "&:before": { display: "none" },
              borderBottom: `1px solid ${alpha(designTokens.brand.gold, 0.08)}`,
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreRounded sx={{ fontSize: 18 }} />} sx={{ px: 0, minHeight: 44 }}>
              <Typography variant="body2" fontWeight={700}>
                {section.title}
              </Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 0, pt: 0, pb: 2 }}>{section.content}</AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    </Box>
  );
}
