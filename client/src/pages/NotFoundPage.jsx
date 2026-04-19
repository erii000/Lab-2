import { Box, Button, Chip, Container, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import AppButton from "../components/common/AppButton.jsx";
import SectionHeading from "../components/common/SectionHeading.jsx";

export default function NotFoundPage() {
  return (
    <Box sx={{ py: { xs: 7, md: 11 } }}>
      <Container maxWidth="md">
        <Stack
          spacing={3}
          sx={{
            p: { xs: 3, md: 5 },
            borderRadius: 3,
            border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.28)}`,
            background:
              "linear-gradient(135deg, rgba(17, 24, 39, 0.88) 0%, rgba(10, 15, 26, 0.9) 60%, rgba(6, 10, 18, 0.95) 100%)",
            boxShadow: "0 20px 56px rgba(0,0,0,0.35)",
          }}
        >
          <Chip
            label="Error 404"
            color="primary"
            sx={{ alignSelf: "flex-start", fontWeight: 700 }}
          />
          <SectionHeading
            eyebrow="Route Not Found"
            title="This destination does not exist"
            subtitle="The page you requested could not be found. We redirected you to a dedicated not-found view so navigation remains clear and recoverable."
          />
          <Typography color="text.secondary">
            The link may be outdated, mistyped, or moved. Use one of the options below to continue planning your trip.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
            <AppButton component={RouterLink} to="/" tone="primary">
              Back to Home
            </AppButton>
            <AppButton component={RouterLink} to="/search" tone="secondary">
              Explore Destinations
            </AppButton>
            <Button component={RouterLink} to="/assistant" variant="text">
              Open Assistant
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
