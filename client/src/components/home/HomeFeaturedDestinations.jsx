import { Box, Chip, Grid, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import { StarRounded } from "../../ui/icons.jsx";
import { buildDestinationUrl } from "../../utils/destinationSearch.js";
import { featuredDestinations } from "./homeData.js";
import { designTokens } from "../../theme/theme.js";

export default function HomeFeaturedDestinations() {
  return (
    <Grid container spacing={2.5}>
      {featuredDestinations.map((dest) => (
        <Grid key={dest.id} size={{ xs: 12, md: 4 }}>
          <Box
            component={RouterLink}
            to={buildDestinationUrl(dest.id)}
            sx={{
              display: "block",
              position: "relative",
              height: { xs: 280, md: 360 },
              borderRadius: 3,
              overflow: "hidden",
              textDecoration: "none",
              border: `1px solid ${alpha(designTokens.brand.gold, 0.2)}`,
              boxShadow: "0 24px 56px rgba(0,0,0,0.35)",
              transition: "transform 0.3s ease, box-shadow 0.3s ease",
              "&:hover": {
                transform: "translateY(-6px)",
                boxShadow: "0 32px 64px rgba(0,0,0,0.45)",
                "& .featured-img": { transform: "scale(1.06)" },
              },
            }}
          >
            <Box
              className="featured-img"
              component="img"
              src={dest.image}
              alt={dest.title}
              sx={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.55s ease",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.88) 100%)",
              }}
            />
            <Stack sx={{ position: "absolute", top: 16, left: 16, right: 16 }} direction="row" spacing={1}>
              <Chip label={dest.country} size="small" sx={{ fontWeight: 700, bgcolor: alpha("#000", 0.45) }} />
              <Chip
                icon={<StarRounded sx={{ fontSize: "14px !important", color: `${designTokens.brand.gold} !important` }} />}
                label={dest.rating.toFixed(1)}
                size="small"
                sx={{ fontWeight: 700, bgcolor: alpha("#000", 0.45), ml: "auto" }}
              />
            </Stack>
            <Stack spacing={1} sx={{ position: "absolute", left: 20, right: 20, bottom: 20 }}>
              <Typography variant="h4" fontWeight={800} color="common.white">
                {dest.title}
              </Typography>
              <Typography variant="body2" sx={{ color: alpha("#fff", 0.88), lineHeight: 1.5 }}>
                {dest.description}
              </Typography>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pt: 0.5 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: designTokens.brand.champagne }}>
                  from €{dest.priceFrom}
                </Typography>
                <Typography
                  variant="caption"
                  fontWeight={800}
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1.5,
                    bgcolor: designTokens.brand.gold,
                    color: designTokens.brand.obsidian,
                  }}
                >
                  Explore
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}
