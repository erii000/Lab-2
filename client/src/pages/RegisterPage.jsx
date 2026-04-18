import { Google, VerifiedRounded } from "../ui/icons.jsx";
import { Button, Checkbox, Divider, FormControlLabel, Link, Stack, TextField, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";

export default function RegisterPage() {
  return (
    <Stack spacing={2.5} component="form" onSubmit={(e) => e.preventDefault()} sx={{ width: "100%" }}>
      <Stack spacing={0.6}>
        <Typography variant="h4" fontWeight={800}>
          Create your account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460 }}>
          Set up your secure workspace for destination discovery, AI trip planning, and booking orchestration.
        </Typography>
      </Stack>
      <TextField label="Full name" fullWidth required autoComplete="name" placeholder="Your full name" />
      <TextField label="Business email" type="email" fullWidth required autoComplete="email" placeholder="you@company.com" />
      <TextField label="Password" type="password" fullWidth required autoComplete="new-password" />
      <TextField label="Confirm password" type="password" fullWidth required autoComplete="new-password" />
      <FormControlLabel
        control={<Checkbox size="small" defaultChecked />}
        label={
          <Typography variant="caption" color="text.secondary">
            I agree to the Terms and Privacy Policy.
          </Typography>
        }
      />
      <Button type="submit" variant="contained" color="primary" size="large" fullWidth sx={{ py: 1.15, fontWeight: 800 }}>
        Sign up
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
          Role-based access and onboarding steps can be attached post-registration
        </Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Already registered?{" "}
        <Link component={RouterLink} to="/login" fontWeight={600}>
          Log in
        </Link>
      </Typography>
    </Stack>
  );
}
