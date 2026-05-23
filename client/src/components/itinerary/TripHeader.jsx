import { BookmarkRounded, ShareRounded } from "../../ui/icons.jsx";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { designTokens } from "../../theme/theme.js";

export default function TripHeader({ meta, onSave, onShare }) {
  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 3,
        overflow: "hidden",
        minHeight: { xs: 140, md: 168 },
        mb: 4,
      }}
    >
      <Box
        component="img"
        src={meta.image}
        alt=""
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(2px) brightness(0.45)",
          transform: "scale(1.05)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(90deg, ${alpha(designTokens.brand.obsidian, 0.92)} 0%, ${alpha(designTokens.brand.obsidian, 0.55)} 100%)`,
        }}
      />
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
        sx={{ position: "relative", p: { xs: 2.5, md: 3.5 } }}
      >
        <Box>
          <Typography
            variant="overline"
            sx={{ color: alpha("#fff", 0.65), letterSpacing: "0.14em", fontWeight: 700 }}
          >
            {meta.location}
          </Typography>
          <Typography variant="h4" fontWeight={800} sx={{ color: "common.white", letterSpacing: "-0.02em", mt: 0.5 }}>
            {meta.dateRange}
          </Typography>
          <Typography variant="body2" sx={{ color: alpha("#fff", 0.78), mt: 0.75 }}>
            {meta.travelers} traveler{meta.travelers > 1 ? "s" : ""} · {meta.vibeLabel}
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.5}>
          <IconButton size="small" onClick={onSave} sx={{ color: alpha("#fff", 0.85) }}>
            <BookmarkRounded fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={onShare} sx={{ color: alpha("#fff", 0.85) }}>
            <ShareRounded fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}
