import { createTheme } from "@mui/material/styles";

/** Design tokens — Smart Travel Assistant */
export const designTokens = {
  brand: {
    obsidian: "#0b0d12",
    charcoal: "#121826",
    graphite: "#1b2435",
    gold: "#d4af6a",
    champagne: "#f4e7c8",
    ivory: "#f9f6ef",
  },
  gradients: {
    hero: "linear-gradient(135deg, rgba(11, 13, 18, 0.96) 0%, rgba(18, 24, 38, 0.94) 55%, rgba(24, 30, 45, 0.9) 100%)",
    cardOverlay: "linear-gradient(180deg, rgba(11, 13, 18, 0.02) 0%, rgba(11, 13, 18, 0.75) 100%)",
  },
};

export const appTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: designTokens.brand.gold,
      light: "#e6c78f",
      dark: "#a78746",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#6fa8dc",
      light: "#92bde4",
      dark: "#4e88bd",
      contrastText: "#ffffff",
    },
    background: {
      default: designTokens.brand.obsidian,
      paper: designTokens.brand.charcoal,
    },
    text: {
      primary: designTokens.brand.ivory,
      secondary: "#b8c2d6",
    },
    divider: "#2a3345",
    error: { main: "#dc2626" },
    warning: { main: "#f59e0b" },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Manrope", "Plus Jakarta Sans", "Segoe UI", system-ui, sans-serif',
    h1: { fontWeight: 700, letterSpacing: "-0.02em" },
    h2: { fontWeight: 700, letterSpacing: "-0.02em" },
    h3: { fontWeight: 600, letterSpacing: "-0.01em" },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    button: { fontWeight: 600, textTransform: "none", letterSpacing: "0.02em" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 12, paddingInline: 18 },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          border: "1px solid #2a3345",
          backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0) 100%)",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.35)",
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
    },
  },
});
