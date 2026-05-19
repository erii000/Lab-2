import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import { Accordion, AccordionDetails, AccordionSummary, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useState } from "react";
import { designTokens } from "../../theme/theme.js";

const faqs = [
  {
    q: "How do I cancel a booking?",
    a: "Open Bookings, select your trip, and use the cancellation flow. Refund eligibility depends on fare rules shown at checkout.",
  },
  {
    q: "Can I change my flight?",
    a: "Date and route changes are supported for flexible fares. Our team can reissue tickets or guide you through self-service changes.",
  },
  {
    q: "What is your refund policy?",
    a: "Refunds are processed within 5–10 business days to the original payment method once the supplier confirms eligibility.",
  },
  {
    q: "I have a payment issue — what should I do?",
    a: "Include your booking ID in the contact form. We verify charges with our payment partners (Stripe / PayPal) and resolve duplicates quickly.",
  },
  {
    q: "Visa and travel requirements?",
    a: "We surface destination advisories in-trip. For official entry rules, check your government portal — we can link verified resources.",
  },
  {
    q: "How does AI trip planning work?",
    a: "The Assistant uses your dates, budget, and preferences to recommend flights, hotels, and experiences you can book in one flow.",
  },
];

export default function ContactFaqPreview() {
  const [expandedId, setExpandedId] = useState(null);

  function handleAccordionChange(id) {
    return (_event, isExpanded) => {
      setExpandedId(isExpanded ? id : null);
    };
  }

  return (
    <Stack spacing={2}>
      {faqs.map((item, index) => {
        const panelId = `faq-${index}`;
        const isOpen = expandedId === panelId;

        return (
          <Accordion
            key={item.q}
            expanded={isOpen}
            onChange={handleAccordionChange(panelId)}
            disableGutters
            elevation={0}
            sx={{
              border: `1px solid ${alpha(designTokens.brand.gold, isOpen ? 0.35 : 0.15)}`,
              borderRadius: "12px !important",
              bgcolor: alpha(designTokens.brand.graphite, isOpen ? 0.55 : 0.4),
              transition: "border-color 0.2s ease, background-color 0.2s ease",
              "&:before": { display: "none" },
              overflow: "hidden",
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreRoundedIcon sx={{ color: "primary.main" }} />}
              aria-controls={`${panelId}-content`}
              id={`${panelId}-header`}
            >
              <Typography fontWeight={700}>{item.q}</Typography>
            </AccordionSummary>
            <AccordionDetails id={`${panelId}-content`} sx={{ pt: 0, pb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {item.a}
              </Typography>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Stack>
  );
}
