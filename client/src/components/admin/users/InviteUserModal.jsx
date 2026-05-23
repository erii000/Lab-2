import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { TRAVELER_STATUS_OPTIONS } from "../../../utils/adminUsers.js";
import { adminColors } from "../adminStyles.js";

export default function InviteUserModal({ open, onClose, onInvite }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Traveler");
  const [status, setStatus] = useState("new");

  function handleSend() {
    if (!email.trim()) return;
    onInvite?.({ email: email.trim(), role, status });
    setEmail("");
    setRole("Traveler");
    setStatus("new");
    onClose?.();
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: 800 }}>Invite traveler</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="Email" type="email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} InputLabelProps={{ shrink: true }} />
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select label="Role" value={role} onChange={(e) => setRole(e.target.value)}>
              <MenuItem value="Traveler">Traveler</MenuItem>
              <MenuItem value="Premium">Premium</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
              {TRAVELER_STATUS_OPTIONS.map((s) => (
                <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} sx={{ color: adminColors.textMuted }}>Cancel</Button>
        <Button variant="contained" onClick={handleSend} disabled={!email.trim()} sx={{ fontWeight: 700 }}>
          Send invite
        </Button>
      </DialogActions>
    </Dialog>
  );
}
