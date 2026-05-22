import { ExpandMoreRounded } from "../../ui/icons.jsx";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { designTokens } from "../../theme/theme.js";

function DetailRow({ label, value }) {
  return (
    <Box sx={{ py: 0.75 }}>
      <Typography variant="caption" color="text.secondary" fontWeight={700} display="block">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function AssistantItineraryAccordion({ days, expanded, onExpandedChange }) {
  return (
    <Box sx={{ mt: 5 }}>
      <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 2, letterSpacing: "0.04em" }}>
        ITINERARY
      </Typography>
      <Stack spacing={1}>
        {days.map((day) => (
          <Accordion
            key={day.id}
            disableGutters
            elevation={0}
            expanded={expanded === day.id}
            onChange={(_, isOpen) => onExpandedChange(isOpen ? day.id : false)}
            sx={{
              border: `1px solid ${alpha(designTokens.brand.gold, 0.1)}`,
              borderRadius: "12px !important",
              "&:before": { display: "none" },
              overflow: "hidden",
              bgcolor: alpha(designTokens.brand.charcoal, 0.4),
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreRounded sx={{ fontSize: 20, color: "text.secondary" }} />}
              sx={{ px: 2.5, py: 0.5, minHeight: 56 }}
            >
              <Box>
                <Typography fontWeight={700}>{day.title}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {day.summary}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 2.5, borderTop: `1px solid ${alpha(designTokens.brand.gold, 0.08)}` }}>
              <DetailRow label="Hotel" value={day.details.hotel} />
              <DetailRow label="Activities" value={day.details.activities} />
              <DetailRow label="Map route" value={day.details.map} />
              <DetailRow label="Restaurants" value={day.details.restaurants} />
            </AccordionDetails>
          </Accordion>
        ))}
      </Stack>
    </Box>
  );
}
