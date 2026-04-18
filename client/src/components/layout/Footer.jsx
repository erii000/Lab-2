import { EmailOutlined, ExploreRounded, GitHubIcon } from "../../ui/icons.jsx";
import { Box, Container, IconButton, Link, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";

export default function Footer({ apiStatus }) {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        background:
          "linear-gradient(180deg, rgba(8,11,18,0.98) 0%, rgba(9,12,19,1) 55%, rgba(7,9,14,1) 100%)",
        color: alpha("#fff", 0.92),
        py: { xs: 4, md: 5 },
        borderTop: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.24)}`,
      }}
    >
      <Container maxWidth="lg">
        <Stack spacing={2.2}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} gap={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Smart Travel Assistant
            </Typography>
            <Stack direction="row" spacing={2.5} flexWrap="wrap" useFlexGap>
              <FooterLink to="/about">About</FooterLink>
              <FooterLink to="/about">Contact</FooterLink>
              <FooterLink to="/about">Terms</FooterLink>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton size="small" sx={iconBtnSx} aria-label="Website">
                <ExploreRounded fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={iconBtnSx} aria-label="Email">
                <EmailOutlined fontSize="small" />
              </IconButton>
              <IconButton size="small" sx={iconBtnSx} aria-label="GitHub">
                <GitHubIcon fontSize="small" />
              </IconButton>
            </Stack>
          </Stack>
          <Typography variant="caption" sx={{ opacity: 0.7 }}>
            © {year} Smart Travel Assistant
          </Typography>
          {apiStatus ? (
            <Typography variant="caption" sx={{ opacity: 0.55 }}>
              API status: {apiStatus.message ?? "connected"}
            </Typography>
          ) : null}
        </Stack>
      </Container>
    </Box>
  );
}

const iconBtnSx = {
  color: alpha("#fff", 0.86),
  border: `1px solid ${alpha("#fff", 0.18)}`,
};

function FooterLink({ to, children }) {
  return (
    <Link
      component={RouterLink}
      to={to}
      color="inherit"
      underline="none"
      variant="body2"
      sx={{
        opacity: 0.86,
        transition: "all 180ms ease",
        "&:hover": { opacity: 1, color: "primary.main" },
      }}
    >
      {children}
    </Link>
  );
}
