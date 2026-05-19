import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneInTalkRoundedIcon from "@mui/icons-material/PhoneInTalkRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { Box, Button, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import AppModal from "../../common/AppModal.jsx";
import { designTokens } from "../../../theme/theme.js";
import { glassCard } from "../contactStyles.js";

const HOTLINE = "+383 XX XXX XXX";
const URGENT_EMAIL = "urgent@travelai.com";

function ContactOptionCard({ icon: Icon, title, detail, accent }) {
  return (
    <Box
      sx={(theme) => ({
        ...glassCard(theme),
        p: 2,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        "&:hover": { transform: "none" },
      })}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          display: "grid",
          placeItems: "center",
          bgcolor: alpha(accent, 0.18),
          color: accent,
          flexShrink: 0,
        }}
      >
        <Icon />
      </Box>
      <Box>
        <Typography variant="subtitle2" fontWeight={800}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {detail}
        </Typography>
      </Box>
    </Box>
  );
}

export default function EmergencyHotlineModal({ open, onClose }) {
  return (
    <AppModal
      open={open}
      onClose={onClose}
      maxWidth="sm"
      title={
        <Stack direction="row" spacing={1} alignItems="center">
          <WarningAmberRoundedIcon sx={{ color: "#f87171", fontSize: 28 }} />
          <span>24/7 Emergency Travel Support</span>
        </Stack>
      }
      subtitle="Get immediate help for urgent travel issues including missed flights, last-minute changes, and emergency assistance."
      actions={
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} width="100%">
          <Button
            component="a"
            href={`tel:${HOTLINE.replace(/\s/g, "")}`}
            variant="contained"
            color="error"
            fullWidth
            startIcon={<PhoneInTalkRoundedIcon />}
            sx={{ fontWeight: 800 }}
          >
            Call Now
          </Button>
          <Button
            component={RouterLink}
            to="/assistant"
            variant="outlined"
            fullWidth
            startIcon={<ChatRoundedIcon />}
            onClick={onClose}
            sx={{ fontWeight: 700 }}
          >
            Start Live Chat
          </Button>
        </Stack>
      }
    >
      <Stack spacing={2}>
        <ContactOptionCard
          icon={PhoneInTalkRoundedIcon}
          title="Emergency Hotline"
          detail={HOTLINE}
          accent="#ef4444"
        />
        <ContactOptionCard
          icon={ChatRoundedIcon}
          title="Live Chat"
          detail="Average response: under 2 min"
          accent={designTokens.brand.gold}
        />
        <ContactOptionCard
          icon={EmailOutlinedIcon}
          title="Priority Email"
          detail={URGENT_EMAIL}
          accent={designTokens.brand.navy}
        />
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ pt: 0.5 }}>
          <PublicRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            Available worldwide 24/7
          </Typography>
        </Stack>
      </Stack>
    </AppModal>
  );
}
