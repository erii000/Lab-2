import { BrandMonogramLogo } from "../../ui/icons.jsx";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import {
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore.js";
import {
  footerAccountLinks,
  footerContact,
  footerQuickLinks,
  footerSocialLinks,
} from "./footerNav.js";

export default function Footer({ apiStatus }) {
  const theme = useTheme();
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: "auto",
        bgcolor: theme.palette.background.default,
        borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.22)}`,
      }}
    >
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 } }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(4, minmax(0, 1fr))",
            },
            columnGap: { xs: 0, sm: 4, lg: 6 },
            rowGap: { xs: 3, sm: 4 },
            alignItems: "start",
          }}
        >
          <Box>
            <FooterBrand />
          </Box>

          <Box>
            <FooterColumn title="Quick links" links={footerQuickLinks} />
          </Box>

          <Box>
            <FooterColumnTitle>Contact</FooterColumnTitle>
            <Stack spacing={1.25} sx={{ mb: 2 }}>
              <ContactLine icon={EmailOutlinedIcon} text={footerContact.email} href={`mailto:${footerContact.email}`} />
              <ContactLine icon={PhoneOutlinedIcon} text={footerContact.phone} href={`tel:${footerContact.phone.replace(/\s/g, "")}`} />
              <ContactLine icon={PlaceOutlinedIcon} text={footerContact.address} />
            </Stack>
            <FooterColumnTitle sx={{ mb: 1 }}>Follow us</FooterColumnTitle>
            <Stack direction="row" spacing={0.75}>
              {footerSocialLinks.map((item) => (
                <IconButton
                  key={item.label}
                  component="a"
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.label}
                  size="small"
                  sx={{
                    color: theme.palette.text.secondary,
                    border: `1px solid ${theme.palette.divider}`,
                    "&:hover": { color: theme.palette.primary.main, borderColor: alpha(theme.palette.primary.main, 0.4) },
                  }}
                >
                  <item.Icon sx={{ fontSize: 18 }} />
                </IconButton>
              ))}
            </Stack>
          </Box>

          <FooterAccountSection />
        </Box>

        <Divider sx={{ my: 2.5, borderColor: theme.palette.divider }} />

        <Stack spacing={0.75} alignItems={{ xs: "flex-start", sm: "center" }} textAlign={{ xs: "left", sm: "center" }}>
          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
            © {year} Smart Travel Assistant. All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ color: alpha(theme.palette.text.secondary, 0.85) }}>
            Made with care for travelers · Powered by AI
          </Typography>
          {apiStatus ? (
            <Typography variant="caption" sx={{ color: alpha(theme.palette.primary.main, 0.7) }}>
              API · {apiStatus.message ?? "connected"}
            </Typography>
          ) : null}
        </Stack>
      </Container>
    </Box>
  );
}

function FooterBrand() {
  const theme = useTheme();

  return (
    <Stack
      component={RouterLink}
      to="/"
      spacing={1}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      sx={{ textDecoration: "none", color: "inherit", alignItems: "flex-start" }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center">
        <BrandMonogramLogo sx={{ fontSize: 32 }} />
        <Typography variant="subtitle1" fontWeight={800} sx={{ color: theme.palette.text.primary, letterSpacing: "-0.02em" }}>
          SmartTravel
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontStyle: "italic", lineHeight: 1.5 }}>
        Your AI-powered travel companion
      </Typography>
    </Stack>
  );
}

function FooterColumnTitle({ children, sx }) {
  const theme = useTheme();
  return (
    <Typography
      variant="overline"
      sx={{
        display: "block",
        mb: 1.25,
        color: theme.palette.primary.main,
        fontWeight: 700,
        letterSpacing: "0.1em",
        fontSize: "0.68rem",
        ...sx,
      }}
    >
      {children}
    </Typography>
  );
}

function FooterColumn({ title, links }) {
  return (
    <Box>
      <FooterColumnTitle>{title}</FooterColumnTitle>
      <Stack spacing={0.5} component="nav" aria-label={title}>
        {links.map((item) => (
          <FooterTextLink key={item.label} to={item.to}>
            {item.label}
          </FooterTextLink>
        ))}
      </Stack>
    </Box>
  );
}

function FooterAccountSection() {
  const theme = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const session = useAuthStore((s) => s.session);
  const logout = useAuthStore((s) => s.logout);

  function handleNavClick() {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }

  function handleLogout() {
    logout();
    handleNavClick();
    navigate("/");
  }

  return (
    <Box>
      <FooterColumnTitle>Account</FooterColumnTitle>
      <Stack
        direction="row"
        spacing={1.25}
        flexWrap="wrap"
        useFlexGap
        component="nav"
        aria-label="Account"
        sx={{ alignItems: "center" }}
      >
        {session ? (
          <>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary, width: "100%", mb: 0.5 }}>
              Signed in as {session.name || session.email}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={handleLogout}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderColor: alpha(theme.palette.primary.main, 0.45),
                color: alpha("#fff", 0.92),
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                },
              }}
            >
              Log out
            </Button>
          </>
        ) : (
          footerAccountLinks.map((item) => {
            const isActive = pathname === item.to;
            const isContained = item.variant === "contained";

            return (
              <Button
                key={item.to}
                component={RouterLink}
                to={item.to}
                onClick={handleNavClick}
                size="small"
                variant={item.variant}
                startIcon={<item.Icon sx={{ fontSize: 17 }} />}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.8125rem",
                  px: 1.75,
                  py: 0.85,
                  borderRadius: 2,
                  whiteSpace: "nowrap",
                  ...(isContained
                    ? {
                        bgcolor: theme.palette.primary.main,
                        color: "#111318",
                        boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.28)}`,
                        "&:hover": {
                          bgcolor: theme.palette.primary.light,
                          boxShadow: `0 6px 18px ${alpha(theme.palette.primary.main, 0.38)}`,
                        },
                      }
                    : {
                        borderColor: alpha(theme.palette.primary.main, isActive ? 0.85 : 0.45),
                        color: isActive ? theme.palette.primary.main : alpha("#fff", 0.92),
                        bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : "transparent",
                        "&:hover": {
                          borderColor: theme.palette.primary.main,
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                        },
                      }),
                }}
              >
                {item.label}
              </Button>
            );
          })
        )}
      </Stack>
    </Box>
  );
}

function FooterTextLink({ to, children, highlight }) {
  const theme = useTheme();
  const { pathname } = useLocation();
  const isActive = pathname === to || (to !== "/" && to.length > 1 && pathname.startsWith(to));

  function handleClick() {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }

  return (
    <Typography
      component={RouterLink}
      to={to}
      onClick={handleClick}
      variant="body2"
      sx={{
        display: "inline-block",
        py: 0.25,
        textDecoration: "none",
        color: highlight || isActive ? theme.palette.primary.main : theme.palette.text.secondary,
        fontWeight: highlight || isActive ? 600 : 400,
        transition: "color 0.15s ease",
        "&:hover": { color: theme.palette.primary.main },
      }}
    >
      {children}
    </Typography>
  );
}

function ContactLine({ icon: Icon, text, href }) {
  const theme = useTheme();
  const content = (
    <Stack direction="row" spacing={1} alignItems="flex-start">
      <Icon sx={{ fontSize: 17, color: theme.palette.primary.main, mt: 0.15 }} />
      <Typography variant="body2" sx={{ color: theme.palette.text.secondary, lineHeight: 1.45 }}>
        {text}
      </Typography>
    </Stack>
  );

  if (href) {
    return (
      <Box
        component="a"
        href={href}
        sx={{
          textDecoration: "none",
          "&:hover .MuiTypography-root": { color: theme.palette.primary.main },
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
}
