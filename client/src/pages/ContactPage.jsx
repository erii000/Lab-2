import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import { Box, Container, Fab, Tooltip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useRef, useState } from "react";
import ContactEmergency from "../components/contact/ContactEmergency.jsx";
import ContactFaqPreview from "../components/contact/ContactFaqPreview.jsx";
import ContactForm from "../components/contact/ContactForm.jsx";
import ContactHero from "../components/contact/ContactHero.jsx";
import ContactSupportChannels from "../components/contact/ContactSupportChannels.jsx";
import { designTokens } from "../theme/theme.js";

function SectionTitle({ overline, title, subtitle, align = "left" }) {
  const centered = align === "center";
  return (
    <Box sx={{ mb: 2.5, textAlign: align }}>
      {overline ? (
        <Typography variant="overline" color="primary" fontWeight={800} letterSpacing="0.14em">
          {overline}
        </Typography>
      ) : null}
      <Typography variant="h5" fontWeight={800} sx={{ mt: overline ? 0.5 : 0 }}>
        {title}
      </Typography>
      {subtitle ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.75, maxWidth: 560, mx: centered ? "auto" : undefined }}
        >
          {subtitle}
        </Typography>
      ) : null}
    </Box>
  );
}

export default function ContactPage() {
  const formRef = useRef(null);
  const [lightSurface, setLightSurface] = useState(false);

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <Box
      sx={{
        bgcolor: lightSurface ? alpha(designTokens.brand.ivory, 0.04) : "background.default",
        color: lightSurface ? designTokens.brand.ivory : "text.primary",
        transition: "background-color 0.35s ease",
        pb: 8,
      }}
    >
      <ContactHero onEmailClick={scrollToForm} lightSurface={lightSurface} />

      <Container
        maxWidth="md"
        sx={{
          mt: { xs: -2, md: -4 },
          position: "relative",
          zIndex: 2,
          px: { xs: 2, sm: 3 },
        }}
      >
        <SectionTitle
          align="center"
          overline="Get in touch"
          title="Send us a message"
          subtitle="Secure form · Encrypted in transit · Our team typically replies within one business day."
        />
        <ContactForm formRef={formRef} lightSurface={lightSurface} />
      </Container>

      <Container maxWidth="lg" sx={{ mt: { xs: 4, md: 5 } }}>
        <SectionTitle
          overline="Channels"
          title="Support channels"
          subtitle="Choose how you want to reach us — every request is routed to the right specialist."
        />
        <ContactSupportChannels lightSurface={lightSurface} />
      </Container>

      <Container maxWidth="lg" sx={{ mt: { xs: 5, md: 7 } }}>
        <SectionTitle overline="FAQ" title="Common questions" subtitle="Quick answers — full documentation in the Help Center." />
        <ContactFaqPreview />
      </Container>

      <Container maxWidth="lg" sx={{ mt: { xs: 4, md: 6 } }}>
        <ContactEmergency />
      </Container>

      <Tooltip title={lightSurface ? "Dark glass mode" : "Light glass mode"}>
        <Fab
          size="small"
          onClick={() => setLightSurface((v) => !v)}
          sx={{
            position: "fixed",
            left: { xs: 16, md: 24 },
            bottom: { xs: 16, md: 28 },
            zIndex: 1200,
            bgcolor: alpha(designTokens.brand.graphite, 0.9),
            color: "primary.main",
            border: `1px solid ${alpha(designTokens.brand.gold, 0.35)}`,
            "&:hover": { bgcolor: alpha(designTokens.brand.navy, 0.5) },
          }}
        >
          {lightSurface ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />}
        </Fab>
      </Tooltip>
    </Box>
  );
}
