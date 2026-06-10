import SendRoundedIcon from "@mui/icons-material/SendRounded";
import {
  Box,
  CircularProgress,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import AdminTopBar from "../../components/admin/AdminTopBar.jsx";
import { adminColors, adminPanelSx } from "../../components/admin/adminStyles.js";
import { useAuthStore } from "../../store/authStore.js";
import {
  loadAdminChatThread,
  loadAdminChatThreads,
  mapHubPayload,
  sendAdminReply,
} from "../../services/chatSync.js";
import { connectChatHub } from "../../services/realtimeChatHub.js";
import { useAdminUsersStore } from "../../store/adminUsersStore.js";
import { formatNotificationTime } from "../../utils/adminNotifications.js";
import { parseApiDate } from "../../utils/parseApiDate.js";

function appendMessage(prev, next, activeUserId) {
  if (!next?.text) return prev;
  if (next.userId != null && Number(next.userId) !== Number(activeUserId) && next.role === "user") {
    return prev;
  }
  const last = prev[prev.length - 1];
  if (last?.role === next.role && last?.text === next.text) return prev;
  return [...prev, next];
}

function displayNameForUser(users, userId) {
  const user = users.find((u) => String(u.id) === String(userId));
  return user?.name ?? `Traveler #${userId}`;
}

export default function AdminMessagesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedUserId = searchParams.get("user");
  const ensureAccessToken = useAuthStore((s) => s.ensureAccessToken);
  const users = useAdminUsersStore((s) => s.users);

  const [threads, setThreads] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const bottomRef = useRef(null);
  const selectedUserIdRef = useRef(selectedUserId);
  const refreshThreadsRef = useRef(null);

  useEffect(() => {
    selectedUserIdRef.current = selectedUserId;
  }, [selectedUserId]);

  const refreshThreads = useCallback(async () => {
    const token = await ensureAccessToken();
    if (!token) return;
    setLoadingThreads(true);
    try {
      const rows = await loadAdminChatThreads(token);
      setThreads(rows);
    } finally {
      setLoadingThreads(false);
    }
  }, [ensureAccessToken]);

  useEffect(() => {
    refreshThreadsRef.current = refreshThreads;
  }, [refreshThreads]);

  const loadThread = useCallback(
    async (userId) => {
      if (!userId) {
        setMessages([]);
        return;
      }
      const token = await ensureAccessToken();
      if (!token) return;
      setLoadingThread(true);
      try {
        const rows = await loadAdminChatThread(token, Number(userId));
        setMessages(rows);
      } finally {
        setLoadingThread(false);
      }
    },
    [ensureAccessToken],
  );

  useEffect(() => {
    void refreshThreads();
  }, [refreshThreads]);

  useEffect(() => {
    void loadThread(selectedUserId);
  }, [selectedUserId, loadThread]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let cancelled = false;
    let hub;

    (async () => {
      const token = await ensureAccessToken();
      if (!token || cancelled) return;

      hub = connectChatHub(
        token,
        (msg) => {
          const mapped = mapHubPayload(msg);
          if (!mapped) return;
          const msgUserId = msg.userId ?? msg.UserId;
          if (mapped.role === "user" && msgUserId != null) {
            void refreshThreadsRef.current();
          }
          const activeUserId = selectedUserIdRef.current;
          if (!activeUserId) return;
          if (msgUserId != null && String(msgUserId) !== String(activeUserId) && mapped.role === "user") {
            return;
          }
          setMessages((prev) => appendMessage(prev, mapped, activeUserId));
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
        console.warn("[SignalR] admin chat hub failed:", err?.message ?? err);
        if (!cancelled) setConnected(false);
      }
    })();

    return () => {
      cancelled = true;
      void hub?.stop();
      setConnected(false);
    };
  }, [ensureAccessToken]);

  function selectUser(userId) {
    setSearchParams({ user: String(userId) });
  }

  async function sendReply() {
    const text = input.trim();
    if (!text || !selectedUserId || sending) return;
    setInput("");
    setSending(true);
    setMessages((prev) => appendMessage(prev, { role: "support", text }, selectedUserId));
    try {
      const token = await ensureAccessToken();
      if (token) await sendAdminReply(token, Number(selectedUserId), text);
      void refreshThreads();
    } finally {
      setSending(false);
    }
  }

  return (
    <Box sx={{ pb: 4 }}>
      <AdminTopBar title="Messages" />
      <Typography variant="body2" sx={{ color: adminColors.textMuted, mb: 2, mt: -2 }}>
        Reply to travelers in real time {connected ? "· live" : "· connecting…"}
      </Typography>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ minHeight: 480 }}>
        <Paper sx={{ ...adminPanelSx, width: { xs: "100%", md: 300 }, flexShrink: 0, p: 0 }}>
          <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${adminColors.border}` }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ color: adminColors.gold }}>
              Conversations
            </Typography>
          </Box>
          {loadingThreads ? (
            <Stack alignItems="center" py={4}>
              <CircularProgress size={24} sx={{ color: adminColors.gold }} />
            </Stack>
          ) : threads.length === 0 ? (
            <Typography variant="body2" sx={{ p: 2, color: adminColors.textMuted }}>
              No live chat messages yet.
            </Typography>
          ) : (
            <List dense disablePadding>
              {threads.map((thread) => {
                const userId = thread.userId ?? thread.UserId;
                const active = String(userId) === String(selectedUserId);
                const lastAt = thread.lastSentAt ?? thread.LastSentAt;
                return (
                  <ListItemButton
                    key={userId}
                    selected={active}
                    onClick={() => selectUser(userId)}
                    sx={{
                      borderLeft: active ? `3px solid ${adminColors.gold}` : "3px solid transparent",
                      bgcolor: active ? alpha(adminColors.gold, 0.08) : "transparent",
                    }}
                  >
                    <ListItemText
                      primary={displayNameForUser(users, userId)}
                      secondary={thread.lastMessage ?? thread.LastMessage ?? ""}
                      primaryTypographyProps={{ fontWeight: active ? 700 : 500, color: "#fff" }}
                      secondaryTypographyProps={{
                        noWrap: true,
                        sx: { color: adminColors.textMuted },
                      }}
                    />
                    {lastAt ? (
                      <Typography variant="caption" sx={{ color: adminColors.gold, flexShrink: 0, ml: 1 }}>
                        {formatNotificationTime(parseApiDate(lastAt) ?? Date.now())}
                      </Typography>
                    ) : null}
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </Paper>

        <Paper sx={{ ...adminPanelSx, flex: 1, p: 2, display: "flex", flexDirection: "column" }}>
          {!selectedUserId ? (
            <Stack alignItems="center" justifyContent="center" sx={{ flex: 1, py: 6 }}>
              <Typography color="text.secondary">Select a conversation or open one from a notification.</Typography>
            </Stack>
          ) : (
            <>
              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1.5 }}>
                {displayNameForUser(users, selectedUserId)}
              </Typography>

              <Box sx={{ flex: 1, overflowY: "auto", mb: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                {loadingThread ? (
                  <Stack alignItems="center" py={4}>
                    <CircularProgress size={24} sx={{ color: adminColors.gold }} />
                  </Stack>
                ) : (
                  messages.map((msg, i) => (
                    <Box
                      key={`${msg.role}-${i}`}
                      sx={{
                        alignSelf: msg.role === "support" ? "flex-end" : "flex-start",
                        maxWidth: "80%",
                        px: 1.5,
                        py: 1,
                        borderRadius: 2,
                        bgcolor:
                          msg.role === "support"
                            ? alpha(adminColors.gold, 0.15)
                            : alpha("#fff", 0.06),
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                        {msg.text}
                      </Typography>
                    </Box>
                  ))
                )}
                <div ref={bottomRef} />
              </Box>

              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Reply to traveler…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void sendReply();
                    }
                  }}
                  disabled={sending}
                />
                <IconButton
                  onClick={() => void sendReply()}
                  disabled={sending || !input.trim()}
                  sx={{ color: adminColors.gold, border: `1px solid ${adminColors.border}` }}
                >
                  <SendRoundedIcon />
                </IconButton>
              </Stack>
            </>
          )}
        </Paper>
      </Stack>
    </Box>
  );
}
