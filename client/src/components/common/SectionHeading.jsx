import { Box, Stack, Typography } from "@mui/material";

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
  align = "left",
  sx,
}) {
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      spacing={2}
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", sm: "flex-end" }}
      sx={{ mb: 3, textAlign: align, ...sx }}
    >
      <Box>
        {eyebrow ? (
          <Typography variant="overline" color="secondary.main" fontWeight={700} letterSpacing="0.12em">
            {eyebrow}
          </Typography>
        ) : null}
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{
            mt: eyebrow ? 0.5 : 0,
            fontSize: { xs: "1.6rem", sm: "2rem" },
            lineHeight: 1.2,
          }}
        >
          {title}
        </Typography>
        {subtitle ? (
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 560, fontSize: { xs: "0.95rem", sm: "1rem" } }}
          >
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {action ? <Box sx={{ flexShrink: 0, width: { xs: "100%", sm: "auto" } }}>{action}</Box> : null}
    </Stack>
  );
}
