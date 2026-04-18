import { StarRounded } from "../../ui/icons.jsx";
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";

export default function ListingCard({
  id,
  title,
  subtitle,
  country,
  image,
  priceFrom,
  rating,
  description,
  tag,
  linkTo,
}) {
  const to = linkTo ?? `/destination/${id}`;

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        overflow: "hidden",
        transition: "transform 260ms ease, box-shadow 260ms ease",
        "&:hover": { transform: "translateY(-6px)", boxShadow: "0 28px 60px rgba(0,0,0,0.42)" },
      }}
    >
      <CardActionArea component={RouterLink} to={to} sx={{ height: "100%", alignItems: "stretch" }}>
        <Box sx={{ position: "relative" }}>
          <CardMedia component="img" height="220" image={image} alt="" sx={{ objectFit: "cover" }} />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(8,10,14,0) 25%, rgba(8,10,14,0.82) 100%)",
            }}
          />
          {tag ? (
            <Chip
              label={tag}
              size="small"
              sx={{
                position: "absolute",
                top: 12,
                left: 12,
                bgcolor: alpha("#d4af6a", 0.92),
                color: "#111318",
                fontWeight: 600,
              }}
            />
          ) : null}
          <Box sx={{ position: "absolute", left: 14, bottom: 12 }}>
            <Typography variant="h6" sx={{ color: "common.white", fontWeight: 700 }}>
              {title}
            </Typography>
            {country ? (
              <Typography variant="body2" sx={{ color: alpha("#fff", 0.86) }}>
                {country}
              </Typography>
            ) : null}
          </Box>
        </Box>
        <CardContent sx={{ textAlign: "left" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Box>{subtitle ? <Typography variant="body2" color="text.secondary">{subtitle}</Typography> : null}</Box>
            <Stack direction="row" spacing={0.25} alignItems="center" sx={{ flexShrink: 0 }}>
              <StarRounded sx={{ fontSize: 20, color: "warning.main" }} />
              <Typography variant="body2" fontWeight={700}>
                {rating?.toFixed?.(1) ?? rating}
              </Typography>
            </Stack>
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }} noWrap>
            {description}
          </Typography>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mt: 2 }}>
            From €{priceFrom}
            <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
              / trip est.
            </Typography>
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
