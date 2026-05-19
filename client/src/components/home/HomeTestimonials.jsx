import { Avatar, Box, Grid, Paper, Rating, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { testimonials } from "./homeData.js";
import { designTokens } from "../../theme/theme.js";

export default function HomeTestimonials() {
  return (
    <Grid container spacing={2.5}>
      {testimonials.map((t) => (
        <Grid key={t.name} size={{ xs: 12, md: 4 }}>
          <Paper
            sx={{
              p: 2.5,
              height: "100%",
              borderRadius: 3,
              border: `1px solid ${alpha(designTokens.brand.gold, 0.15)}`,
              background: `linear-gradient(145deg, ${alpha("#fff", 0.04)} 0%, ${alpha(designTokens.brand.charcoal, 0.95)} 100%)`,
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <Avatar
                src={t.photo}
                alt={t.name}
                slotProps={{ img: { loading: "lazy" } }}
                sx={{
                  width: 52,
                  height: 52,
                  bgcolor: alpha(designTokens.brand.navy, 0.6),
                  border: `2px solid ${alpha(designTokens.brand.gold, 0.45)}`,
                  boxShadow: `0 4px 14px ${alpha("#000", 0.35)}`,
                }}
              />
              <Box>
                <Typography fontWeight={800}>{t.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {t.role}
                </Typography>
              </Box>
            </Stack>
            <Rating value={t.rating} readOnly size="small" sx={{ mb: 1.5 }} />
            <Typography variant="body2" sx={{ lineHeight: 1.6, color: alpha(designTokens.brand.ivory, 0.82) }}>
              {t.text}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
