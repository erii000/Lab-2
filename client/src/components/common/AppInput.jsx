import TextField from "@mui/material/TextField";
import { useMemo, useState } from "react";

export default function AppInput({
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
  helperText,
  ...props
}) {
  const [touched, setTouched] = useState(false);

  const validationMessage = useMemo(() => {
    if (!validate) {
      return "";
    }
    return validate(value);
  }, [validate, value]);

  const activeError = externalError || (touched ? validationMessage : "");

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
      autoComplete={autoComplete}
      placeholder={placeholder}
      error={Boolean(activeError)}
      helperText={activeError || helperText || " "}
      {...props}
    />
  );
}
