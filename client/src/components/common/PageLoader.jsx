import { Box, CircularProgress, Stack, Typography } from "@mui/material";
import { alpha, keyframes } from "@mui/material/styles";
import { designTokens } from "../../theme/theme.js";

const pulse = keyframes`
  0%, 100% { opacity: 0.45; transform: scale(0.92); }
  50% { opacity: 1; transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

export default function PageLoader({ label = "Loading page" }) {
  return (
    <Box
      role="status"
      aria-live="polite"
      aria-busy="true"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: { xs: "52vh", md: "58vh" },
        px: 2,
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: 72,
          height: 72,
          display: "grid",
          placeItems: "center",
          mb: 3,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `2px solid ${alpha(designTokens.brand.gold, 0.15)}`,
          }}
        />
        <CircularProgress
          size={56}
          thickness={2.2}
          sx={{
            color: designTokens.brand.gold,
            "& .MuiCircularProgress-circle": { strokeLinecap: "round" },
          }}
        />
        <Box
          sx={{
            position: "absolute",
            width: 8,
            height: 8,
            borderRadius: "50%",
            bgcolor: designTokens.brand.gold,
            boxShadow: `0 0 12px ${alpha(designTokens.brand.gold, 0.65)}`,
            animation: `${pulse} 1.4s ease-in-out infinite`,
          }}
        />
      </Box>

      <Stack spacing={1.25} alignItems="center" sx={{ maxWidth: 320, textAlign: "center" }}>
        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{ color: "text.primary", letterSpacing: "-0.02em" }}
        >
          {label}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
          Preparing your experience…
        </Typography>
        <Box
          sx={{
            mt: 1,
            width: 160,
            height: 3,
            borderRadius: 999,
            overflow: "hidden",
            bgcolor: alpha("#fff", 0.06),
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: "100%",
              background: `linear-gradient(90deg, transparent, ${alpha(designTokens.brand.gold, 0.85)}, transparent)`,
              backgroundSize: "200% 100%",
              animation: `${shimmer} 1.6s ease-in-out infinite`,
            }}
          />
        </Box>
      </Stack>
    </Box>
  );
}
