import { Google, VerifiedRounded } from "../ui/icons.jsx";
import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import AppButton from "../components/common/AppButton.jsx";
import AppInput from "../components/common/AppInput.jsx";

export default function LoginPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [submitError, setSubmitError] = useState({});

  const handleFieldChange = (field) => (event) => {
    const nextValue = event.target.value;
    setForm((current) => ({ ...current, [field]: nextValue }));
    setSubmitError((current) => {
      if (!current[field]) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const nextErrors = {};
    const emailError = validateBusinessEmail(form.email);
    const passwordError = validateLoginPassword(form.password);

    if (emailError) {
      nextErrors.email = emailError;
    }
    if (passwordError) {
      nextErrors.password = passwordError;
    }

    setSubmitError(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
  };

  return (
    <Stack spacing={2.5} component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
      <BoxTitle />
      <AppInput
        label="Business email"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@company.com"
        value={form.email}
        onChange={handleFieldChange("email")}
        validate={validateBusinessEmail}
        externalError={submitError.email}
      />
      <AppInput
        label="Password"
        name="password"
        type="password"
        required
        autoComplete="current-password"
        value={form.password}
        onChange={handleFieldChange("password")}
        validate={validateLoginPassword}
        externalError={submitError.password}
        helperText="Use at least 8 characters."
      />
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} sx={{ mt: -0.5 }} spacing={0.5}>
        <FormControlLabel
          control={<Checkbox size="small" defaultChecked />}
          label={<Typography variant="caption" color="text.secondary">Keep me signed in</Typography>}
        />
        <Link component={RouterLink} to="/about" variant="caption" underline="hover" sx={{ color: "primary.main", fontWeight: 700 }}>
          Need help?
        </Link>
      </Stack>
      <AppButton type="submit" tone="primary" size="large" fullWidth sx={{ py: 1.15, fontWeight: 800 }}>
        Log in
      </AppButton>
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
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: -0.5, flexWrap: "wrap" }} useFlexGap>
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

function validateBusinessEmail(value) {
  if (!value.trim()) {
    return "Business email is required.";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return "Enter a valid email address.";
  }
  return "";
}

function validateLoginPassword(value) {
  if (!value) {
    return "Password is required.";
  }
  if (value.length < 8) {
    return "Password must be at least 8 characters.";
  }
  return "";
}
