import { Checkbox, FormControlLabel, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthInput from "../components/auth/AuthInput.jsx";
import { AUTH_FIELD_STACK_SPACING } from "../components/auth/authLayoutConstants.js";
import { authPrimaryButtonSx } from "../components/auth/authStyles.js";
import { useToast } from "../context/ToastContext.jsx";
import { useAuthStore } from "../store/authStore.js";
import AppButton from "../components/common/AppButton.jsx";
import { designTokens } from "../theme/theme.js";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [submitError, setSubmitError] = useState({});

  const setField = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setSubmitError((err) => {
      if (!err[field]) return err;
      const next = { ...err };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (validateName(form.fullName)) nextErrors.fullName = validateName(form.fullName);
    if (validateEmail(form.email)) nextErrors.email = validateEmail(form.email);
    if (validatePassword(form.password)) nextErrors.password = validatePassword(form.password);
    if (validateConfirm(form.password, form.confirmPassword)) nextErrors.confirmPassword = validateConfirm(form.password, form.confirmPassword);
    setSubmitError(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const result = login(form.email, form.password);
    if (result.ok) {
      showToast({ message: `Welcome, ${form.fullName.split(" ")[0]}.`, severity: "success" });
      navigate("/", { replace: true });
    } else {
      showToast({ message: "Account created. Please sign in.", severity: "success" });
      navigate("/login", { replace: true });
    }
  };

  return (
    <Stack component="form" onSubmit={handleSubmit} spacing={AUTH_FIELD_STACK_SPACING}>
      <AuthInput
        label="Full name"
        name="fullName"
        required
        autoComplete="name"
        placeholder="Alex Morgan"
        value={form.fullName}
        onChange={setField("fullName")}
        validate={validateName}
        externalError={submitError.fullName}
      />
      <AuthInput
        label="Email address"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@company.com"
        value={form.email}
        onChange={setField("email")}
        validate={validateEmail}
        externalError={submitError.email}
      />
      <AuthInput
        label="Password"
        name="password"
        type="password"
        required
        autoComplete="new-password"
        placeholder="8+ chars, 1 uppercase, 1 number"
        value={form.password}
        onChange={setField("password")}
        validate={validatePassword}
        externalError={submitError.password}
      />
      <AuthInput
        label="Confirm password"
        name="confirmPassword"
        type="password"
        required
        autoComplete="new-password"
        placeholder="Re-enter your password"
        value={form.confirmPassword}
        onChange={setField("confirmPassword")}
        validate={(v) => validateConfirm(form.password, v)}
        externalError={submitError.confirmPassword}
      />

      <FormControlLabel
        sx={{ m: 0, alignItems: "flex-start", pt: 0.5 }}
        control={
          <Checkbox
            size="small"
            defaultChecked
            sx={{ color: alpha("#fff", 0.35), mt: 0.2, "&.Mui-checked": { color: designTokens.brand.gold } }}
          />
        }
        label={
          <Typography variant="body2" sx={{ color: alpha("#fff", 0.5), lineHeight: 1.5 }}>
            I agree to the Terms and Privacy Policy
          </Typography>
        }
      />

      <AppButton type="submit" tone="primary" fullWidth sx={authPrimaryButtonSx}>
        Create account
      </AppButton>
    </Stack>
  );
}

function validateName(value) {
  if (!value.trim()) return "Name is required";
  if (value.trim().length < 3) return "At least 3 characters";
  return "";
}

function validateEmail(value) {
  if (!value.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email";
  return "";
}

function validatePassword(value) {
  if (!value) return "Password is required";
  if (value.length < 8) return "At least 8 characters";
  if (!/[A-Z]/.test(value) || !/\d/.test(value)) return "Include uppercase and a number";
  return "";
}

function validateConfirm(password, confirm) {
  if (!confirm) return "Please confirm your password";
  if (password !== confirm) return "Passwords do not match";
  return "";
}
