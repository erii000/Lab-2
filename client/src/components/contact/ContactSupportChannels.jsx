import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import TelegramIcon from "@mui/icons-material/Telegram";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { Box, Button, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import { designTokens } from "../../theme/theme.js";
import { glassCard } from "./contactStyles.js";

const CARD_MIN_HEIGHT = 196;

const channels = [
  {
    icon: ChatRoundedIcon,
    title: "Live Chat",
    detail: "Under 2 min avg. response",
    action: "Open chat",
    href: "/assistant",
    external: false,
    accent: designTokens.brand.gold,
  },
  {
    icon: EmailOutlinedIcon,
    title: "Email",
    detail: "support@smarttravel.app",
    action: "Send email",
    href: "mailto:support@smarttravel.app",
    external: true,
    accent: designTokens.brand.navy,
  },
  {
    icon: PhoneRoundedIcon,
    title: "Phone",
    detail: "+32 2 808 44 20",
    sub: "EN · FR · NL",
    action: "Call now",
    href: "tel:+3228084420",
    external: true,
    accent: "#6fa8dc",
  },
  {
    icon: WhatsAppIcon,
    title: "WhatsApp",
    detail: "+32 470 12 34 56",
    action: "Message",
    href: "https://wa.me/32470123456",
    external: true,
    accent: "#25D366",
  },
  {
    icon: TelegramIcon,
    title: "Telegram",
    detail: "@SmartTravelSupport",
    action: "Connect",
    href: "https://t.me/SmartTravelSupport",
    external: true,
    accent: "#229ED9",
  },
];

function ChannelCard({ channel, lightSurface }) {
  const { icon: Icon, title, detail, sub, action, href, external, accent } = channel;

  return (
    <Box
      sx={(theme) => ({
        ...glassCard(theme, { light: lightSurface }),
        p: 2.25,
        minHeight: CARD_MIN_HEIGHT,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
      })}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          bgcolor: alpha(accent, 0.16),
          color: accent,
          mb: 1.5,
        }}
      >
        <Icon sx={{ fontSize: 22 }} />
      </Box>

      <Typography variant="subtitle1" fontWeight={800} lineHeight={1.2} sx={{ mb: 0.75 }}>
        {title}
      </Typography>

      <Box sx={{ flex: 1, minHeight: 48 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontWeight: 600,
            lineHeight: 1.45,
            wordBreak: "break-word",
          }}
        >
          {detail}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "block",
            mt: 0.5,
            minHeight: sub ? "auto" : 18,
            opacity: sub ? 1 : 0,
          }}
        >
          {sub || "\u00a0"}
        </Typography>
      </Box>

      <Button
        component={external ? "a" : RouterLink}
        href={external ? href : undefined}
        to={!external ? href : undefined}
        target={external && href.startsWith("http") ? "_blank" : undefined}
        rel={external && href.startsWith("http") ? "noopener noreferrer" : undefined}
        variant="outlined"
        size="small"
        fullWidth
        sx={{
          mt: 2,
          fontWeight: 700,
          py: 0.85,
          borderColor: alpha(accent, 0.45),
          color: accent,
          "&:hover": {
            borderColor: accent,
            bgcolor: alpha(accent, 0.1),
          },
        }}
      >
        {action}
      </Button>
    </Box>
  );
}

export default function ContactSupportChannels({ lightSurface }) {
  return (
    <Box
      sx={{
        display: "grid",
        gap: 2,
        gridTemplateColumns: {
          xs: "1fr",
          sm: "repeat(2, minmax(0, 1fr))",
          md: "repeat(3, minmax(0, 1fr))",
          lg: "repeat(5, minmax(0, 1fr))",
        },
        alignItems: "stretch",
      }}
    >
      {channels.map((ch) => (
        <ChannelCard key={ch.title} channel={ch} lightSurface={lightSurface} />
      ))}
    </Box>
  );
}
