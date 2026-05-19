import { AutoAwesomeRounded, CloseRounded, SendRounded } from "../../../ui/icons.jsx";
import {
  Box,
  Fab,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  Zoom,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useState } from "react";

const REPLIES = [
  "For nightlife, I recommend stays near Le Marais or the Latin Quarter — Hotel 5★ option scores highest.",
  "June 4 has the best sunset window for a Seine cruise based on your dates.",
  "Switching to the Premium Air flight adds lounge access with only +€120 per person.",
];

export default function AiTripChatFab() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Ask me anything about your trip — hotels, weather, or experiences." },
  ]);

  function send() {
    const q = input.trim();
    if (!q) return;
    setMessages((m) => [
      ...m,
      { role: "user", text: q },
      { role: "ai", text: REPLIES[messages.length % REPLIES.length] },
    ]);
    setInput("");
  }

  return (
    <>
      <Zoom in>
        <Fab
          color="primary"
          onClick={() => setOpen((o) => !o)}
          sx={{
            position: "fixed",
            bottom: open ? 280 : 24,
            right: 24,
            zIndex: 1300,
            boxShadow: (t) => `0 12px 36px ${alpha(t.palette.primary.main, 0.45)}`,
          }}
        >
          {open ? <CloseRounded /> : <AutoAwesomeRounded />}
        </Fab>
      </Zoom>

      {open ? (
        <Paper
          elevation={12}
          sx={{
            position: "fixed",
            bottom: 88,
            right: 24,
            width: 340,
            maxWidth: "calc(100vw - 32px)",
            zIndex: 1300,
            borderRadius: 3,
            overflow: "hidden",
            border: (t) => `1px solid ${alpha(t.palette.primary.main, 0.4)}`,
            bgcolor: alpha("#0f1524", 0.96),
            backdropFilter: "blur(16px)",
          }}
        >
          <Box sx={{ p: 1.5, borderBottom: 1, borderColor: "divider" }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Ask AI about your trip…
            </Typography>
          </Box>
          <Stack spacing={1} sx={{ p: 1.5, maxHeight: 220, overflow: "auto" }}>
            {messages.map((msg, i) => (
              <Box
                key={i}
                sx={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  maxWidth: "90%",
                  p: 1,
                  borderRadius: 2,
                  bgcolor: msg.role === "user" ? (t) => alpha(t.palette.secondary.main, 0.25) : alpha("#1b2435", 0.9),
                }}
              >
                <Typography variant="body2">{msg.text}</Typography>
              </Box>
            ))}
          </Stack>
          <Stack direction="row" spacing={0.5} sx={{ p: 1, borderTop: 1, borderColor: "divider" }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Which hotel has the best nightlife nearby?"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <IconButton color="primary" onClick={send}>
              <SendRounded />
            </IconButton>
          </Stack>
        </Paper>
      ) : null}
    </>
  );
}
