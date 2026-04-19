import Button from "@mui/material/Button";

const toneStyles = {
  primary: {
    variant: "contained",
    color: "primary",
    sx: {
      fontWeight: 700,
    },
  },
  secondary: {
    variant: "outlined",
    color: "secondary",
    sx: {
      fontWeight: 700,
      borderWidth: "1px",
    },
  },
};

export default function AppButton({
  tone = "primary",
  children,
  variant,
  color,
  sx,
  ...props
}) {
  const preset = toneStyles[tone] ?? toneStyles.primary;

  return (
    <Button
      variant={variant ?? preset.variant}
      color={color ?? preset.color}
      sx={{ ...preset.sx, ...sx }}
      {...props}
    >
      {children}
    </Button>
  );
}
