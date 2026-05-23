import { VerifiedRounded } from "../../ui/icons.jsx";
import { Box, Chip, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useState } from "react";
import { AUTH_IMAGE_FALLBACK } from "../../constants/authVisuals.js";
import { AUTH_IMAGE_COLUMN_WIDTH } from "./authLayoutConstants.js";
import { designTokens } from "../../theme/theme.js";

export default function AuthHeroPanel({ image, copy }) {
  const [src, setSrc] = useState(image);

  return (
    <Box
      sx={{
        position: "relative",
        width: { xs: "100%", md: AUTH_IMAGE_COLUMN_WIDTH },
        flexShrink: 0,
        minHeight: { xs: 200, md: "100%" },
        overflow: "hidden",
        display: { xs: "none", md: "block" },
        bgcolor: designTokens.brand.graphite,
      }}
    >
      <Box
        component="img"
        src={src}
        alt=""
        loading="eager"
        onError={() => setSrc(AUTH_IMAGE_FALLBACK)}
        sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, transparent 30%, rgba(8,10,16,0.85) 100%)`,
        }}
      />
      <Stack spacing={1.25} sx={{ position: "absolute", left: 28, right: 28, bottom: 28, zIndex: 1 }}>
        <Chip
          icon={<VerifiedRounded sx={{ fontSize: 14 }} />}
          label={copy.eyebrow}
          size="small"
          sx={{
            alignSelf: "flex-start",
            height: 28,
            bgcolor: alpha("#000", 0.45),
            color: "#fff",
            border: `1px solid ${alpha(designTokens.brand.gold, 0.35)}`,
            fontWeight: 600,
            fontSize: "0.7rem",
          }}
        />
        <Typography
          variant="h6"
          sx={{
            color: "#fff",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            lineHeight: 1.2,
            whiteSpace: "pre-line",
            fontSize: "1.4rem",
          }}
        >
          {copy.title}
        </Typography>
      </Stack>
    </Box>
  );
}
