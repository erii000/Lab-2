import { Google, VerifiedRounded } from "../ui/icons.jsx";
import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Link,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";

export default function LoginPage() {
  return (
    <Stack spacing={2.5} component="form" onSubmit={(e) => e.preventDefault()} sx={{ width: "100%" }}>
      <BoxTitle />
      <TextField
        label="Business email"
        type="email"
        fullWidth
        required
        autoComplete="email"
        placeholder="you@company.com"
      />
      <TextField label="Password" type="password" fullWidth required autoComplete="current-password" />
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: -0.5 }}>
        <FormControlLabel
          control={<Checkbox size="small" defaultChecked />}
          label={<Typography variant="caption" color="text.secondary">Keep me signed in</Typography>}
        />
        <Link component={RouterLink} to="/about" variant="caption" underline="hover" sx={{ color: "primary.main", fontWeight: 700 }}>
          Need help?
        </Link>
      </Stack>
      <Button type="submit" variant="contained" color="primary" size="large" fullWidth sx={{ py: 1.15, fontWeight: 800 }}>
        Log in
      </Button>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Divider sx={{ flex: 1 }} />
        <Typography variant="caption" color="text.secondary">
          or continue with
        </Typography>
        <Divider sx={{ flex: 1 }} />
      </Stack>
      <Button
        variant="outlined"
        fullWidth
        startIcon={<Google />}
        disabled
        sx={{ py: 1.1, borderColor: alpha("#fff", 0.2), color: "text.secondary" }}
      >
        Continue with Google
      </Button>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: -0.5 }}>
        <VerifiedRounded sx={{ fontSize: 18, color: "primary.main" }} />
        <Typography variant="caption" color="text.secondary">
          Secure token authentication · optional 2FA can be enabled later
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        No account?{" "}
        <Link component={RouterLink} to="/register" fontWeight={600}>
          Register
        </Link>
      </Typography>
    </Stack>
  );
}

function BoxTitle() {
  return (
    <Stack spacing={0.6}>
      <Typography variant="h4" fontWeight={800}>
        Welcome back
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460 }}>
        Access your account to continue premium itinerary planning, booking controls, and AI-assisted trip workflows.
      </Typography>
    </Stack>
  );
}
