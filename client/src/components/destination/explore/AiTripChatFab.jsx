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
import { useEffect, useState } from "react";
import { loadAiChatHistory, pickAiReply, sendChatTurn } from "../../../services/chatSync.js";
import { connectChatHub } from "../../../services/realtimeChatHub.js";
import { useAuthStore } from "../../../store/authStore.js";

export default function AiTripChatFab() {
  const session = useAuthStore((s) => s.session);
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Ask me anything about your trip — hotels, weather, or experiences." },
  ]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!open || !session?.accessToken) return undefined;
    let cancelled = false;
    let hub;

    loadAiChatHistory(session.accessToken)
      .then((history) => {
        if (!cancelled) setMessages(history);
      })
      .catch(() => null);

    (async () => {
      const token = await useAuthStore.getState().ensureAccessToken();
      if (!token || cancelled) return;
      hub = connectChatHub(token, (msg) => {
        const text = msg.text ?? msg.Text ?? "";
        if (!text) return;
        setMessages((m) => [...m, { role: "ai", text }]);
      });
      try {
        await hub.start();
      } catch {
        /* REST fallback still works */
      }
    })();

    return () => {
      cancelled = true;
      hub?.stop();
    };
  }, [open, session?.accessToken]);

  async function send() {
    const q = input.trim();
    if (!q || sending) return;
    setInput("");
    setSending(true);
    try {
      if (session?.accessToken) {
        const turn = await sendChatTurn(session.accessToken, q, messages.length);
        setMessages((m) => [...m, { role: "user", text: turn.userText }, { role: "ai", text: turn.aiText }]);
      } else {
        setMessages((m) => [
          ...m,
          { role: "user", text: q },
          { role: "ai", text: pickAiReply(m.length) },
        ]);
      }
    } finally {
      setSending(false);
    }
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
            {!session ? (
              <Typography variant="caption" color="text.secondary">
                Log in to save chat history
              </Typography>
            ) : null}
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
              onKeyDown={(e) => e.key === "Enter" && !sending && send()}
              disabled={sending}
            />
            <IconButton color="primary" onClick={send} disabled={sending}>
              <SendRounded />
            </IconButton>
          </Stack>
        </Paper>
      ) : null}
    </>
  );
}
