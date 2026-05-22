import { BookmarkRounded, StarRounded } from "../../ui/icons.jsx";
import { Box, Button, Card, Chip, IconButton, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import { designTokens } from "../../theme/theme.js";

export default function ExploreDestinationCard({
  destination,
  linkTo,
  saved,
  onToggleSave,
  suggestReason,
}) {
  const badge = suggestReason || destination.badge;

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 3,
        overflow: "hidden",
        border: `1px solid ${alpha(designTokens.brand.gold, 0.1)}`,
        bgcolor: alpha(designTokens.brand.charcoal, 0.5),
        transition: "transform 0.35s ease, box-shadow 0.35s ease",
        "&:hover": {
          transform: "translateY(-6px)",
          boxShadow: `0 24px 48px ${alpha(designTokens.brand.navy, 0.35)}`,
          "& .explore-card-img": { transform: "scale(1.04)" },
          "& .explore-card-cta": { opacity: 1 },
        },
      }}
    >
      <Box sx={{ position: "relative", overflow: "hidden" }}>
        <Box
          component="img"
          className="explore-card-img"
          src={destination.image}
          alt=""
          sx={{
            width: "100%",
            height: 200,
            objectFit: "cover",
            display: "block",
            transition: "transform 0.5s ease",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(8,10,14,0.15) 0%, rgba(8,10,14,0.75) 100%)",
          }}
        />
        {badge ? (
          <Chip
            label={badge}
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              left: 12,
              fontWeight: 700,
              bgcolor: alpha(designTokens.brand.obsidian, 0.75),
              border: `1px solid ${alpha(designTokens.brand.gold, 0.35)}`,
            }}
          />
        ) : null}
        <IconButton
          size="small"
          onClick={(e) => {
            e.preventDefault();
            onToggleSave?.(destination.id);
          }}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            bgcolor: alpha("#000", 0.35),
            color: saved ? "primary.main" : "common.white",
          }}
        >
          <BookmarkRounded fontSize="small" />
        </IconButton>
        <Button
          component={RouterLink}
          to={linkTo}
          className="explore-card-cta"
          variant="contained"
          size="small"
          sx={{
            position: "absolute",
            bottom: 12,
            right: 12,
            opacity: 0,
            transition: "opacity 0.3s ease",
            fontWeight: 700,
          }}
        >
          View trip →
        </Button>
      </Box>

      <Stack spacing={0.75} sx={{ p: 2.25 }}>
        <Typography variant="h6" fontWeight={800}>
          {destination.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {destination.country}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.55, minHeight: 40 }}>
          {destination.aiSummary}
        </Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 1 }}>
          <Typography variant="subtitle1" fontWeight={800}>
            From €{destination.priceFrom}
          </Typography>
          <Stack direction="row" spacing={0.5} alignItems="center">
            <StarRounded sx={{ fontSize: 18, color: "primary.main" }} />
            <Typography variant="body2" fontWeight={700}>
              {destination.rating}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Card>
  );
}
