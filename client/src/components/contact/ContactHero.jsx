import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import { Box, Button, Chip, Container, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import { chipGlow, heroGradient } from "./contactStyles.js";
import { designTokens } from "../../theme/theme.js";

const perks = [
  { icon: AccessTimeRoundedIcon, label: "24/7 support" },
  { icon: SpeedRoundedIcon, label: "Fast response time" },
  { icon: AutoAwesomeRoundedIcon, label: "AI-powered travel assistance" },
];

export default function ContactHero({ onChatClick, lightSurface }) {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        py: { xs: 5, md: 8 },
        background: heroGradient,
        borderBottom: `1px solid ${alpha(designTokens.brand.gold, 0.12)}`,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1800&q=80)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: lightSurface ? 0.22 : 0.14,
          mixBlendMode: "luminosity",
        }}
      />
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Stack spacing={3} alignItems={{ xs: "stretch", md: "flex-start" }} maxWidth={720}>
          <Chip label="Premium support" size="small" sx={chipGlow} />
          <Box>
            <Typography
              variant="overline"
              sx={{ color: alpha(designTokens.brand.champagne, 0.85), letterSpacing: "0.2em", fontWeight: 700 }}
            >
              We&apos;re here for your next journey.
            </Typography>
            <Typography
              component="h1"
              sx={{
                mt: 1,
                fontWeight: 800,
                fontSize: { xs: "2rem", sm: "2.75rem", md: "3.25rem" },
                lineHeight: 1.08,
                letterSpacing: "-0.03em",
                background: `linear-gradient(120deg, ${designTokens.brand.ivory} 0%, ${designTokens.brand.champagne} 45%, ${designTokens.brand.gold} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              How can we help you?
            </Typography>
            <Typography variant="h5" sx={{ mt: 1.5, fontWeight: 600, color: "text.secondary", fontSize: { xs: "1.1rem", md: "1.35rem" } }}>
              Contact Our Travel Support Team
            </Typography>
          </Box>

          <Stack direction="row" flexWrap="wrap" gap={1}>
            {perks.map(({ icon: Icon, label }) => (
              <Chip
                key={label}
                icon={<Icon sx={{ fontSize: 16 }} />}
                label={label}
                size="small"
                sx={{
                  ...chipGlow,
                  "& .MuiChip-icon": { color: designTokens.brand.gold },
                }}
              />
            ))}
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ pt: 0.5 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<ForumRoundedIcon />}
              onClick={onChatClick}
              sx={{
                fontWeight: 800,
                px: 3,
                background: `linear-gradient(135deg, ${designTokens.brand.gold}, ${alpha(designTokens.brand.gold, 0.85)})`,
                color: designTokens.brand.obsidian,
              }}
            >
              Start Live Chat
            </Button>
            <Button
              component={RouterLink}
              to="/assistant"
              variant="outlined"
              size="large"
              startIcon={<EmailOutlinedIcon />}
              sx={{
                borderColor: alpha(designTokens.brand.gold, 0.5),
                color: designTokens.brand.champagne,
                fontWeight: 700,
                "&:hover": { borderColor: designTokens.brand.gold, bgcolor: alpha(designTokens.brand.gold, 0.1) },
              }}
            >
              AI Assistant
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
