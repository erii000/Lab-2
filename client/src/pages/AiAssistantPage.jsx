import { CameraAltRounded, SendRounded, AutoAwesomeRounded, VerifiedRounded } from "../ui/icons.jsx";
import {
  Avatar,
  Box,
  Button,
  CardMedia,
  Chip,
  Container,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";

const starterPrompt = "Plan a 5-day trip to Paris under €1000";

export default function AiAssistantPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(() => [
    {
      role: "assistant",
      content:
        "Hi — I'm your Smart Travel Assistant. Ask for budgets, pacing, or themes. Below is sample structured output your team can stream from the LLM layer.",
    },
    {
      role: "assistant",
      content:
        "**Sample itinerary (mock)**\n• Day 1: Arrival, Montmartre sunset\n• Day 2: Louvre + Seine walk\n• Day 3: Versailles day trip\n• Day 4: Le Marais food crawl\n• Day 5: Café morning & departure\n\n_Save_ pushes JSON into ItineraryService.",
    },
  ]);

  function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((m) => [
      ...m,
      { role: "user", content: text },
      {
        role: "assistant",
        content:
          "Acknowledged (design shell). Wire your chat API here — stream tokens, attach tool calls for hotels/flights, and expose Save / Edit as itinerary mutations.",
      },
    ]);
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="overline" color="secondary" fontWeight={700}>
          Super feature
        </Typography>
        <Typography variant="h4" fontWeight={800}>
          AI assistant
        </Typography>
        <Typography color="text.secondary">
          Chat-first planner — pair with RealTimeCommunicationService for typing indicators if needed.
        </Typography>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2.5 }}>
        {[
          "https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?auto=format&fit=crop&w=1200&q=80",
        ].map((src, idx) => (
          <Box key={src} sx={{ position: "relative", borderRadius: 2, overflow: "hidden", flex: 1 }}>
            <CardMedia component="img" image={src} height="132" alt="" />
            <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.12), rgba(0,0,0,0.68))" }} />
            <Stack direction="row" spacing={1} sx={{ position: "absolute", left: 12, bottom: 10 }} alignItems="center">
              {idx === 0 ? <CameraAltRounded sx={{ color: "common.white", fontSize: 18 }} /> : <VerifiedRounded sx={{ color: "common.white", fontSize: 18 }} />}
              <Typography variant="caption" sx={{ color: "common.white", fontWeight: 700 }}>
                {idx === 0 ? "Visual trip inspiration" : "Reliable AI trip structuring"}
              </Typography>
            </Stack>
          </Box>
        ))}
      </Stack>

      <Paper
        sx={{
          height: { xs: "70vh", md: 560 },
          display: "flex",
          flexDirection: "column",
          borderRadius: 2,
          overflow: "hidden",
          border: (t) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: (t) => `1px solid ${t.palette.divider}`,
            bgcolor: alpha("#0c4a6e", 0.04),
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar sx={{ bgcolor: "secondary.main", width: 32, height: 32 }}>
              <AutoAwesomeRounded sx={{ fontSize: 20 }} />
            </Avatar>
            <Typography fontWeight={700}>Trip copilot</Typography>
            <Chip size="small" label="Beta" sx={{ ml: "auto" }} />
          </Stack>
        </Box>

        <Box sx={{ flex: 1, overflow: "auto", p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          {messages.map((msg, i) => (
            <Stack
              key={`${msg.role}-${i}`}
              direction="row"
              spacing={1.5}
              justifyContent={msg.role === "user" ? "flex-end" : "flex-start"}
            >
              {msg.role === "assistant" ? (
                <Avatar sx={{ bgcolor: "secondary.main", width: 36, height: 36 }}>
                  <AutoAwesomeRounded sx={{ fontSize: 22 }} />
                </Avatar>
              ) : null}
              <Paper
                variant="outlined"
                sx={{
                  px: 2,
                  py: 1.5,
                  maxWidth: "85%",
                  bgcolor: msg.role === "user" ? alpha("#0d9488", 0.08) : "background.paper",
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {msg.content}
                </Typography>
              </Paper>
            </Stack>
          ))}
        </Box>

        <Box
          component="form"
          onSubmit={handleSend}
          sx={{
            p: 2,
            borderTop: (t) => `1px solid ${t.palette.divider}`,
            bgcolor: "background.default",
          }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              fullWidth
              placeholder={starterPrompt}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              multiline
              maxRows={4}
              size="small"
            />
            <Button type="submit" variant="contained" color="secondary" sx={{ minWidth: 120 }} endIcon={<SendRounded />}>
              Send
            </Button>
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
            <Chip
              label={starterPrompt}
              size="small"
              onClick={() => setInput(starterPrompt)}
              variant="outlined"
            />
            <Button component={RouterLink} to="/itinerary" size="small">
              Save to itinerary (mock)
            </Button>
            <Button component={RouterLink} to="/itinerary" size="small" color="secondary">
              Edit in planner
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}
