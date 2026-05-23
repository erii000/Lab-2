import { Checkbox, FormControlLabel, Link, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import AuthInput from "../components/auth/AuthInput.jsx";
import { AUTH_FIELD_STACK_SPACING } from "../components/auth/authLayoutConstants.js";
import { authPrimaryButtonSx } from "../components/auth/authStyles.js";
import { useToast } from "../context/ToastContext.jsx";
import { ADMIN_DEMO, useAuthStore } from "../store/authStore.js";
import AppButton from "../components/common/AppButton.jsx";
import { designTokens } from "../theme/theme.js";

export default function LoginPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const login = useAuthStore((s) => s.login);
  const [form, setForm] = useState({ email: "", password: "" });
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
    const emailError = validateEmail(form.email);
    const passwordError = validatePassword(form.password);
    if (emailError) nextErrors.email = emailError;
    if (passwordError) nextErrors.password = passwordError;
    setSubmitError(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const result = login(form.email, form.password);
    if (!result.ok) {
      setSubmitError({ password: result.message });
      return;
    }
    if (result.role === "admin") {
      showToast({ message: "Welcome back, admin.", severity: "success" });
      navigate("/admin", { replace: true });
    } else {
      showToast({ message: "Signed in successfully.", severity: "success" });
      navigate("/", { replace: true });
    }
  };

  return (
    <Stack component="form" onSubmit={handleSubmit} spacing={AUTH_FIELD_STACK_SPACING}>
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
        autoComplete="current-password"
        placeholder="Enter your password"
        value={form.password}
        onChange={setField("password")}
        validate={validatePassword}
        externalError={submitError.password}
      />

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 0.5 }}>
        <FormControlLabel
          control={
            <Checkbox
              size="small"
              defaultChecked
              sx={{ color: alpha("#fff", 0.35), "&.Mui-checked": { color: designTokens.brand.gold } }}
            />
          }
          label={<Typography variant="body2" sx={{ color: alpha("#fff", 0.5) }}>Remember me</Typography>}
        />
        <Link component={RouterLink} to="/contact" sx={{ color: designTokens.brand.gold, fontWeight: 600, fontSize: "0.875rem" }}>
          Forgot password?
        </Link>
      </Stack>

      <AppButton type="submit" tone="primary" fullWidth sx={authPrimaryButtonSx}>
        Sign in
      </AppButton>

      <Typography variant="caption" sx={{ color: alpha("#fff", 0.4), textAlign: "center", lineHeight: 1.5 }}>
        Demo admin · {ADMIN_DEMO.email} · {ADMIN_DEMO.password}
      </Typography>
    </Stack>
  );
}

function validateEmail(value) {
  if (!value.trim()) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Enter a valid email";
  return "";
}

function validatePassword(value) {
  if (!value) return "Password is required";
  if (value.length < 8) return "At least 8 characters";
  return "";
}
