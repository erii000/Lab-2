import { BrandMonogramLogo, VerifiedRounded } from "../ui/icons.jsx";
import { Box, CardMedia, Chip, Container, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink, Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        py: 4,
        background: "radial-gradient(circle at 20% 0%, #1c2233 0%, #0b0d12 52%, #080a0f 100%)",
      }}
    >
      <Container maxWidth="md">
        <Stack spacing={3} alignItems="center">
          <Stack
            direction="row"
            spacing={1.2}
            alignItems="center"
            component={RouterLink}
            to="/"
            sx={{ textDecoration: "none", color: "common.white" }}
          >
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
                background: "rgba(10,12,18,0.75)",
              }}
            >
              <BrandMonogramLogo sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} letterSpacing="-0.02em" lineHeight={1.05}>
                Smart Travel Assistant
              </Typography>
              <Typography variant="caption" sx={{ color: alpha("#fff", 0.7), letterSpacing: "0.08em" }}>
                SECURE CLIENT ACCESS
              </Typography>
            </Box>
          </Stack>
          <Paper
            elevation={0}
            sx={{
              width: "100%",
              p: { xs: 2, sm: 3 },
              borderRadius: 4,
              border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.28)}`,
              boxShadow: "0 30px 70px rgba(0,0,0,0.45)",
              background: "linear-gradient(180deg, rgba(18,24,38,0.96) 0%, rgba(15,20,33,0.96) 100%)",
            }}
          >
            <Stack direction={{ xs: "column", md: "row" }} spacing={0}>
              <Box sx={{ flex: { md: "0 0 46%" }, minHeight: { xs: 170, md: 520 }, position: "relative", borderRadius: 3, overflow: "hidden" }}>
                <CardMedia
                  component="img"
                  image="https://images.unsplash.com/photo-1503220317375-aaad61436b1b?auto=format&fit=crop&w=1400&q=80"
                  alt=""
                  sx={{ height: "100%" }}
                />
                <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,11,18,0.12), rgba(8,11,18,0.82))" }} />
                <Stack spacing={1.2} sx={{ position: "absolute", left: 16, right: 16, bottom: 16 }}>
                  <Chip
                    icon={<VerifiedRounded />}
                    label="Protected authentication"
                    size="small"
                    sx={{ alignSelf: "flex-start", bgcolor: alpha("#111318", 0.74), color: "common.white" }}
                  />
                  <Typography variant="h6" sx={{ color: "common.white", fontWeight: 800 }}>
                    Access your luxury travel workspace
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha("#fff", 0.86) }}>
                    Continue planning premium journeys with secure account access and personalized AI context.
                  </Typography>
                </Stack>
              </Box>

              <Box sx={{ flex: 1, px: { xs: 1, md: 3 }, py: { xs: 2, md: 1 }, display: "flex", alignItems: "center" }}>
                <Outlet />
              </Box>
            </Stack>
          </Paper>
          <Typography variant="caption" sx={{ color: alpha("#fff", 0.85) }}>
            Enterprise-grade entry surface · OAuth and MFA ready
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
