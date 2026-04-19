import { Google, VerifiedRounded } from "../ui/icons.jsx";
import { Button, Checkbox, Divider, FormControlLabel, Link, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import AppButton from "../components/common/AppButton.jsx";
import AppInput from "../components/common/AppInput.jsx";

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
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
    const nameError = validateFullName(form.fullName);
    const emailError = validateBusinessEmail(form.email);
    const passwordError = validateStrongPassword(form.password);
    const confirmError = validateConfirmPassword(form.password, form.confirmPassword);

    if (nameError) {
      nextErrors.fullName = nameError;
    }
    if (emailError) {
      nextErrors.email = emailError;
    }
    if (passwordError) {
      nextErrors.password = passwordError;
    }
    if (confirmError) {
      nextErrors.confirmPassword = confirmError;
    }

    setSubmitError(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }
  };

  return (
    <Stack spacing={2.5} component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
      <Stack spacing={0.6}>
        <Typography variant="h4" fontWeight={800}>
          Create your account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460 }}>
          Set up your secure workspace for destination discovery, AI trip planning, and booking orchestration.
        </Typography>
      </Stack>
      <AppInput
        label="Full name"
        name="fullName"
        required
        autoComplete="name"
        placeholder="Your full name"
        value={form.fullName}
        onChange={handleFieldChange("fullName")}
        validate={validateFullName}
        externalError={submitError.fullName}
      />
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
        autoComplete="new-password"
        value={form.password}
        onChange={handleFieldChange("password")}
        validate={validateStrongPassword}
        externalError={submitError.password}
        helperText="Minimum 8 characters, with 1 uppercase letter and 1 number."
      />
      <AppInput
        label="Confirm password"
        name="confirmPassword"
        type="password"
        required
        autoComplete="new-password"
        value={form.confirmPassword}
        onChange={handleFieldChange("confirmPassword")}
        validate={(value) => validateConfirmPassword(form.password, value)}
        externalError={submitError.confirmPassword}
      />
      <FormControlLabel
        control={<Checkbox size="small" defaultChecked />}
        label={
          <Typography variant="caption" color="text.secondary">
            I agree to the Terms and Privacy Policy.
          </Typography>
        }
      />
      <AppButton type="submit" tone="primary" size="large" fullWidth sx={{ py: 1.15, fontWeight: 800 }}>
        Sign up
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

function validateFullName(value) {
  if (!value.trim()) {
    return "Full name is required.";
  }
  if (value.trim().length < 3) {
    return "Full name must be at least 3 characters.";
  }
  return "";
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

function validateStrongPassword(value) {
  if (!value) {
    return "Password is required.";
  }
  if (value.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (!/[A-Z]/.test(value) || !/\d/.test(value)) {
    return "Use at least 1 uppercase letter and 1 number.";
  }
  return "";
}

function validateConfirmPassword(password, confirmPassword) {
  if (!confirmPassword) {
    return "Please confirm your password.";
  }
  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }
  return "";
}
