import SendRoundedIcon from "@mui/icons-material/SendRounded";

import { Box, IconButton, Paper, Stack, TextField, Typography } from "@mui/material";

import { alpha } from "@mui/material/styles";

import { useEffect, useRef, useState } from "react";

import { loadChatHistory, mapHubPayload, sendSupportMessage } from "../../services/chatSync.js";

import { connectChatHub } from "../../services/realtimeChatHub.js";

import { useAuthStore } from "../../store/authStore.js";

import { designTokens } from "../../theme/theme.js";

import { glassCard } from "./contactStyles.js";



function appendMessage(prev, next) {

  if (!next) return prev;

  const last = prev[prev.length - 1];

  if (last?.role === next.role && last?.text === next.text) return prev;

  return [...prev, next];

}



export default function ContactLiveChat({ lightSurface }) {

  const session = useAuthStore((s) => s.session);

  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState("");

  const [sending, setSending] = useState(false);

  const [connected, setConnected] = useState(false);

  const bottomRef = useRef(null);



  useEffect(() => {

    bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  }, [messages]);



  useEffect(() => {

    if (!session?.accessToken) return undefined;

    let cancelled = false;

    let hub;



    loadChatHistory(session.accessToken)

      .then((history) => {

        if (!cancelled) setMessages(history);

      })

      .catch(() => {

        if (!cancelled) {

          setMessages([

            {

              role: "support",

              text: "Hi — ask a quick question here and our team will reply in real time while you browse.",

            },

          ]);

        }

      });



    (async () => {

      const token = await useAuthStore.getState().ensureAccessToken();

      if (!token || cancelled) return;

      hub = connectChatHub(

        token,

        (msg) => {

          const mapped = mapHubPayload(msg);

          if (mapped?.role === "user") return;

          setMessages((prev) => appendMessage(prev, mapped));

        },

        {

          onConnected: () => {

            if (!cancelled) setConnected(true);

          },

          onDisconnected: () => {

            if (!cancelled) setConnected(false);

          },

        },

      );

      try {

        await hub.start();

        if (!cancelled) setConnected(true);

      } catch (err) {

        console.warn("[SignalR] chat hub failed:", err?.message ?? err);

        if (!cancelled) setConnected(false);

      }

    })();



    return () => {

      cancelled = true;

      hub?.stop();

      setConnected(false);

    };

  }, [session?.accessToken]);



  if (!session?.accessToken) return null;



  async function send() {

    const question = input.trim();

    if (!question || sending) return;

    setInput("");

    setSending(true);

    setMessages((prev) => appendMessage(prev, { role: "user", text: question }));

    try {

      await sendSupportMessage(session.accessToken, question);

    } catch (err) {

      setMessages((prev) =>

        appendMessage(prev, {

          role: "support",

          text: "We could not send your message. Please try again in a moment.",

        }),

      );

    } finally {

      setSending(false);

    }

  }



  return (

    <Paper

      elevation={0}

      sx={{

        ...glassCard(lightSurface),

        mt: 3,

        p: { xs: 2, sm: 2.5 },

        border: `1px solid ${alpha(designTokens.brand.gold, 0.22)}`,

      }}

    >

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>

        <Typography variant="subtitle1" fontWeight={800}>

          Live chat

        </Typography>

        <Typography variant="caption" color={connected ? "success.main" : "text.secondary"}>

          {connected ? "Connected · live" : "Connecting…"}

        </Typography>

      </Stack>



      <Box

        sx={{

          maxHeight: 280,

          overflowY: "auto",

          mb: 1.5,

          pr: 0.5,

          display: "flex",

          flexDirection: "column",

          gap: 1,

        }}

      >

        {messages.map((msg, i) => (

          <Box

            key={`${msg.role}-${i}-${msg.text.slice(0, 12)}`}

            sx={{

              alignSelf: msg.role === "user" ? "flex-end" : "flex-start",

              maxWidth: "85%",

              px: 1.5,

              py: 1,

              borderRadius: 2,

              bgcolor:

                msg.role === "user"

                  ? alpha(designTokens.brand.gold, 0.18)

                  : alpha(lightSurface ? designTokens.brand.navy : designTokens.brand.ivory, 0.08),

            }}

          >

            {msg.role === "support" ? (

              <Typography variant="caption" sx={{ display: "block", opacity: 0.7, mb: 0.25 }}>

                Support

              </Typography>

            ) : null}

            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>

              {msg.text}

            </Typography>

          </Box>

        ))}

        <div ref={bottomRef} />

      </Box>



      <Stack direction="row" spacing={1}>

        <TextField

          fullWidth

          size="small"

          placeholder="Type a message…"

          value={input}

          onChange={(e) => setInput(e.target.value)}

          onKeyDown={(e) => {

            if (e.key === "Enter" && !e.shiftKey) {

              e.preventDefault();

              void send();

            }

          }}

          disabled={sending}

        />

        <IconButton color="primary" onClick={() => void send()} disabled={sending || !input.trim()}>

          <SendRoundedIcon />

        </IconButton>

      </Stack>

    </Paper>

  );

}


