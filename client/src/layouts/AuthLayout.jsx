import { BrandMonogramLogo } from "../ui/icons.jsx";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink, Outlet, useLocation } from "react-router-dom";
import AuthHeroPanel from "../components/auth/AuthHeroPanel.jsx";
import { AUTH_FORM_MAX_WIDTH, AUTH_SHELL_MAX_WIDTH } from "../components/auth/authLayoutConstants.js";
import AuthModeTabs from "../components/auth/AuthModeTabs.jsx";
import { authCardSx } from "../components/auth/authStyles.js";
import { AUTH_HERO_COPY, AUTH_IMAGES } from "../constants/authVisuals.js";
import { designTokens } from "../theme/theme.js";

const HEADLINES = {
  login: {
    title: "Welcome back",
    subtitle: "Sign in to manage trips, bookings, and AI planning.",
  },
  register: {
    title: "Create account",
    subtitle: "Join Smart Travel and unlock your travel workspace.",
  },
};

export default function AuthLayout() {
  const { pathname } = useLocation();
  const mode = pathname.includes("register") ? "register" : "login";
  const headline = HEADLINES[mode];

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 4, sm: 6 },
        px: { xs: 2, sm: 3 },
        bgcolor: designTokens.brand.obsidian,
        background: `
          radial-gradient(ellipse 70% 45% at 50% 0%, ${alpha(designTokens.brand.gold, 0.1)} 0%, transparent 55%),
          ${designTokens.brand.obsidian}
        `,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: AUTH_SHELL_MAX_WIDTH }}>
        <Stack
          component={RouterLink}
          to="/"
          direction="row"
          spacing={1.25}
          alignItems="center"
          justifyContent="center"
          sx={{ textDecoration: "none", color: "inherit", mb: 3 }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: "grid",
              placeItems: "center",
              border: `1px solid ${alpha(designTokens.brand.gold, 0.35)}`,
              bgcolor: alpha("#000", 0.2),
            }}
          >
            <BrandMonogramLogo sx={{ fontSize: 24 }} />
          </Box>
          <Typography variant="h6" fontWeight={800} sx={{ color: "#fff", letterSpacing: "-0.02em" }}>
            Smart Travel
          </Typography>
        </Stack>

        <Paper elevation={0} sx={{ ...authCardSx, display: "flex", flexDirection: { xs: "column", md: "row" } }}>
          <Box
            sx={{
              display: { xs: "block", md: "none" },
              height: 180,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Box
              component="img"
              src={AUTH_IMAGES[mode]}
              alt=""
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(0deg, ${designTokens.brand.charcoal} 0%, transparent 70%)`,
              }}
            />
          </Box>

          <AuthHeroPanel image={AUTH_IMAGES[mode]} copy={AUTH_HERO_COPY[mode]} />

          <Box
            sx={{
              flex: 1,
              minWidth: 0,
              px: { xs: 3, sm: 4.5, md: 5 },
              py: { xs: 4, sm: 4.5, md: 5 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Box sx={{ width: "100%", maxWidth: AUTH_FORM_MAX_WIDTH }}>
              <AuthModeTabs />
              <Typography variant="h5" fontWeight={800} sx={{ color: "#fff", letterSpacing: "-0.02em", mb: 0.75 }}>
                {headline.title}
              </Typography>
              <Typography variant="body2" sx={{ color: alpha("#fff", 0.5), mb: 3.5, lineHeight: 1.55 }}>
                {headline.subtitle}
              </Typography>
              <Outlet />
            </Box>
          </Box>
        </Paper>

        <Typography
          variant="caption"
          sx={{ display: "block", textAlign: "center", mt: 2.5, color: alpha("#fff", 0.35) }}
        >
          Secure · Encrypted sessions · Smart Travel Assistant
        </Typography>
      </Box>
    </Box>
  );
}
