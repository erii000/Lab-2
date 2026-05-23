import { Box, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { designTokens } from "../../theme/theme.js";

const tabs = [
  { id: "login", label: "Sign in", to: "/login" },
  { id: "register", label: "Sign up", to: "/register" },
];

export default function AuthModeTabs() {
  const { pathname } = useLocation();
  const active = pathname.includes("register") ? "register" : "login";

  return (
    <Box
      role="tablist"
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 1,
        p: 0.75,
        mb: 3.5,
        borderRadius: 3,
        bgcolor: alpha("#000", 0.3),
        border: `1px solid ${alpha("#fff", 0.06)}`,
      }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <Box
            key={tab.id}
            component={RouterLink}
            to={tab.to}
            role="tab"
            aria-selected={isActive}
            sx={{
              py: 1.25,
              borderRadius: 2.5,
              textAlign: "center",
              textDecoration: "none",
              transition: "all 0.2s ease",
              bgcolor: isActive ? alpha(designTokens.brand.gold, 0.2) : "transparent",
              boxShadow: isActive ? `inset 0 0 0 1px ${alpha(designTokens.brand.gold, 0.45)}` : "none",
              "&:hover": { bgcolor: isActive ? undefined : alpha("#fff", 0.05) },
            }}
          >
            <Typography
              variant="body2"
              fontWeight={isActive ? 700 : 500}
              sx={{ color: isActive ? designTokens.brand.gold : alpha("#fff", 0.45) }}
            >
              {tab.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}
