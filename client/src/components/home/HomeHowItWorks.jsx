import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import FlightTakeoffRoundedIcon from "@mui/icons-material/FlightTakeoffRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { Box, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { howItWorksSteps } from "./homeData.js";
import { designTokens } from "../../theme/theme.js";

const stepIcons = {
  search: SearchRoundedIcon,
  ai: AutoAwesomeOutlinedIcon,
  book: FlightTakeoffRoundedIcon,
};

const stepBlue = "#6fa8dc";

const stepAccent = {
  glow: stepBlue,
  border: alpha(stepBlue, 0.5),
};

export default function HomeHowItWorks() {
  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 4,
        p: { xs: 2.5, md: 4 },
        overflow: "hidden",
        border: `1px solid ${alpha(designTokens.brand.gold, 0.12)}`,
        background: `linear-gradient(165deg, ${alpha(designTokens.brand.navy, 0.18)} 0%, ${alpha(designTokens.brand.obsidian, 0.95)} 45%, ${alpha(designTokens.brand.charcoal, 0.98)} 100%)`,
        boxShadow: `inset 0 1px 0 ${alpha("#fff", 0.06)}`,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: -80,
          right: -80,
          width: 240,
          height: 240,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(designTokens.brand.gold, 0.12)} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: { xs: 0, md: 3 },
          position: "relative",
        }}
      >
        {/* Connector line — desktop */}
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            position: "absolute",
            top: 56,
            left: "16.66%",
            right: "16.66%",
            height: 2,
            background: `linear-gradient(90deg, ${alpha(stepBlue, 0.25)}, ${stepBlue}, ${alpha(stepBlue, 0.25)})`,
            borderRadius: 1,
            zIndex: 0,
          }}
        />

        {howItWorksSteps.map((step, index) => {
          const StepIcon = stepIcons[step.iconKey];
          const accent = stepAccent;

          return (
            <Box
              key={step.title}
              sx={{
                position: "relative",
                zIndex: 1,
                px: { xs: 0, md: 1 },
                pb: { xs: index < 2 ? 3 : 0, md: 0 },
              }}
            >
              {/* Vertical connector — mobile */}
              {index < howItWorksSteps.length - 1 ? (
                <Box
                  sx={{
                    display: { xs: "block", md: "none" },
                    position: "absolute",
                    left: 27,
                    top: 72,
                    bottom: 0,
                    width: 2,
                    background: `linear-gradient(180deg, ${accent.glow}, transparent)`,
                  }}
                />
              ) : null}

              <Stack
                alignItems={{ xs: "flex-start", md: "center" }}
                textAlign={{ xs: "left", md: "center" }}
                spacing={2}
                direction={{ xs: "row", md: "column" }}
                sx={{
                  transition: "transform 0.35s ease",
                  "&:hover": { transform: { md: "translateY(-6px)" } },
                }}
              >
                <Box sx={{ position: "relative", flexShrink: 0 }}>
                  <Box
                    sx={{
                      width: { xs: 56, md: 72 },
                      height: { xs: 56, md: 72 },
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      bgcolor: alpha(accent.glow, 0.2),
                      border: `2px solid ${accent.border}`,
                      boxShadow: `0 0 32px ${alpha(accent.glow, 0.35)}`,
                      color: "secondary.main",
                    }}
                  >
                    <StepIcon sx={{ fontSize: { xs: 28, md: 34 } }} />
                  </Box>
                  <Box
                    sx={{
                      position: "absolute",
                      top: -6,
                      right: { xs: -8, md: "auto" },
                      left: { md: "50%" },
                      transform: { md: "translateX(24px)" },
                      minWidth: 28,
                      height: 28,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      bgcolor: designTokens.brand.gold,
                      color: designTokens.brand.obsidian,
                      boxShadow: `0 4px 12px ${alpha(designTokens.brand.gold, 0.4)}`,
                    }}
                  >
                    {index + 1}
                  </Box>
                </Box>

                <Box sx={{ flex: 1, minWidth: 0, pt: { xs: 0.5, md: 0 } }}>
                  <Typography
                    variant="overline"
                    sx={{
                      display: { xs: "block", md: "none" },
                      color: "secondary.main",
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      mb: 0.5,
                    }}
                  >
                    Step {index + 1}
                  </Typography>
                  <Typography variant="h6" fontWeight={800} sx={{ mb: 0.75 }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65, maxWidth: 280, mx: { md: "auto" } }}>
                    {step.text}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
