import TextField from "@mui/material/TextField";
import { useMemo, useState } from "react";
import { authFieldSx } from "./authStyles.js";

export default function AuthInput({
  value,
  onChange,
  label,
  name,
  type = "text",
  required = false,
  autoComplete,
  placeholder,
  validate,
  externalError = "",
  ...props
}) {
  const [touched, setTouched] = useState(false);
  const validationMessage = useMemo(() => (validate ? validate(value) : ""), [validate, value]);
  const error = externalError || (touched ? validationMessage : "");

  return (
    <TextField
      label={label}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      onBlur={() => setTouched(true)}
      fullWidth
      required={required}
      size="medium"
      autoComplete={autoComplete}
      placeholder={placeholder}
      error={Boolean(error)}
      helperText={error || " "}
      FormHelperTextProps={{
        sx: {
          visibility: error ? "visible" : "hidden",
          minHeight: "1.25rem",
        },
      }}
      sx={authFieldSx}
      {...props}
    />
  );
}
