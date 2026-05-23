import CreditCardRoundedIcon from "@mui/icons-material/CreditCardRounded";
import LockRoundedIcon from "@mui/icons-material/LockRounded";
import {
  Alert,
  Box,
  Chip,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useState } from "react";
import { maskCardNumber, validateCardPayload } from "../../utils/paymentGateway.js";
import { designTokens } from "../../theme/theme.js";

export default function SecureCheckoutForm({
  amount,
  currency = "EUR",
  method,
  onMethodChange,
  onCardChange,
  errors: externalErrors,
}) {
  const [card, setCard] = useState({
    name: "",
    cardNumber: "",
    expiry: "",
    cvc: "",
  });
  const [localErrors, setLocalErrors] = useState({});

  const errors = { ...localErrors, ...externalErrors };

  function update(field, value) {
    let formatted = value;
    if (field === "cardNumber") {
      formatted = value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ").trim();
    }
    if (field === "expiry") {
      formatted = value.replace(/\D/g, "").slice(0, 4);
      if (formatted.length >= 2) formatted = `${formatted.slice(0, 2)}/${formatted.slice(2)}`;
    }
    if (field === "cvc") formatted = value.replace(/\D/g, "").slice(0, 4);

    const next = { ...card, [field]: formatted };
    setCard(next);
    setLocalErrors(validateCardPayload(next));
    onCardChange?.(next);
  }

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <LockRoundedIcon fontSize="small" sx={{ color: designTokens.brand.gold }} />
        <Typography variant="subtitle2" fontWeight={800}>
          Secure checkout
        </Typography>
        <Chip size="small" label="PCI-ready UI" sx={{ ml: "auto", fontWeight: 600 }} />
      </Stack>

      <FormControl component="fieldset" sx={{ mb: 2, width: "100%" }}>
        <RadioGroup value={method} onChange={(e) => onMethodChange(e.target.value)}>
          <FormControlLabel value="card" control={<Radio color="primary" />} label="Credit / debit card (Stripe)" />
          <FormControlLabel value="paypal" control={<Radio color="primary" />} label="PayPal" />
        </RadioGroup>
      </FormControl>

      {method === "card" ? (
        <Stack spacing={2}>
          <TextField
            label="Cardholder name"
            fullWidth
            value={card.name}
            onChange={(e) => update("name", e.target.value)}
            error={Boolean(errors.name)}
            helperText={errors.name}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Card number"
            fullWidth
            value={card.cardNumber}
            onChange={(e) => update("cardNumber", e.target.value)}
            error={Boolean(errors.cardNumber)}
            helperText={errors.cardNumber}
            placeholder="4242 4242 4242 4242"
            InputProps={{ startAdornment: <CreditCardRoundedIcon fontSize="small" sx={{ mr: 1, opacity: 0.6 }} /> }}
            InputLabelProps={{ shrink: true }}
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Expiry"
              fullWidth
              value={card.expiry}
              onChange={(e) => update("expiry", e.target.value)}
              error={Boolean(errors.expiry)}
              helperText={errors.expiry}
              placeholder="MM/YY"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="CVC"
              fullWidth
              value={card.cvc}
              onChange={(e) => update("cvc", e.target.value)}
              error={Boolean(errors.cvc)}
              helperText={errors.cvc}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </Stack>
      ) : (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          You will be redirected to PayPal to complete €{amount?.toLocaleString()} {currency}.
        </Alert>
      )}

      <Box
        sx={{
          mt: 2,
          p: 1.5,
          borderRadius: 2,
          bgcolor: alpha(designTokens.brand.gold, 0.08),
          border: `1px solid ${alpha(designTokens.brand.gold, 0.2)}`,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          Demo: use any valid Luhn card number. Ending <strong>0002</strong> simulates decline. Transactions are logged
          locally.
        </Typography>
        {card.cardNumber ? (
          <Typography variant="body2" fontWeight={700} sx={{ mt: 0.5 }}>
            {maskCardNumber(card.cardNumber)}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}

