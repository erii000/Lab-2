import { AutoAwesomeRounded, CloseRounded, SendRounded } from "../../../ui/icons.jsx";
import {
  Box,
  Drawer,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useState } from "react";
import { adminColors, adminPanelSx } from "../adminStyles.js";

const REPLIES = {
  underperforming: "Underperforming trips: Roman Holiday (2.1% conversion), Barcelona Nights (cancel rate 4.2%). Consider seasonal promos.",
  summer: "Summer offer draft: 15% off Mediterranean city breaks · Jun–Aug · Featured on homepage.",
  cancellations: "Highest cancellations: Sydney Premium (6), Paris Escape (4). Review refund policies.",
  default: "I can help with trip performance, AI-generated packages, pricing, and demand forecasts. Try asking about underperforming trips.",
};

export default function TripsAiAssistant({ open, onClose, onGenerate }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Ask me about trips — e.g. “Show underperforming trips” or “Generate summer offers”." },
  ]);

  function send() {
    const q = input.trim();
    if (!q) return;
    const key = Object.keys(REPLIES).find((k) => q.toLowerCase().includes(k.replace("_", " ")) || q.toLowerCase().includes(k));
    const reply = REPLIES[key] ?? REPLIES.default;
    setMessages((m) => [...m, { role: "user", text: q }, { role: "ai", text: reply }]);
    setInput("");
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 380 },
          bgcolor: adminColors.bg,
          borderLeft: `1px solid ${adminColors.border}`,
        },
      }}
    >
      <Stack sx={{ height: "100%" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2, borderBottom: `1px solid ${adminColors.border}` }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <AutoAwesomeRounded sx={{ color: adminColors.gold }} />
            <Typography fontWeight={800} sx={{ color: "#fff" }}>AI assistant</Typography>
          </Stack>
          <IconButton onClick={onClose} size="small"><CloseRounded /></IconButton>
        </Stack>
        <Stack sx={{ flex: 1, overflow: "auto", p: 2 }} spacing={1.5}>
          {messages.map((msg, i) => (
            <Box
              key={i}
              sx={{
                ...adminPanelSx,
                p: 1.5,
                alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "90%",
                bgcolor: msg.role === "user" ? alpha(adminColors.gold, 0.12) : undefined,
              }}
            >
              <Typography variant="body2" sx={{ color: adminColors.textMuted, lineHeight: 1.55 }}>{msg.text}</Typography>
            </Box>
          ))}
        </Stack>
        <Stack direction="row" spacing={1} sx={{ p: 2, borderTop: `1px solid ${adminColors.border}` }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Ask anything…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <IconButton color="primary" onClick={send}><SendRounded /></IconButton>
        </Stack>
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography
            component="button"
            type="button"
            variant="caption"
            onClick={() => onGenerate?.()}
            sx={{ border: "none", bgcolor: "transparent", color: adminColors.gold, cursor: "pointer", fontWeight: 700 }}
          >
            + AI generate new trip from prompt
          </Typography>
        </Box>
      </Stack>
    </Drawer>
  );
}
