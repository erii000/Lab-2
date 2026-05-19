const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactField(name, value) {
  const v = typeof value === "string" ? value.trim() : value;
  switch (name) {
    case "fullName":
      if (!v) return "Full name is required";
      if (v.length < 2) return "Enter at least 2 characters";
      return "";
    case "email":
      if (!v) return "Email is required";
      if (!EMAIL_RE.test(v)) return "Enter a valid email address";
      return "";
    case "subject":
      if (!v) return "Subject is required";
      if (v.length < 3) return "Subject is too short";
      return "";
    case "message":
      if (!v) return "Message is required";
      if (v.length < 20) return "Please provide more detail (20+ characters)";
      return "";
    case "bookingId":
      return "";
    default:
      return "";
  }
}

export function validateContactForm(form) {
  const fields = ["fullName", "email", "subject", "message"];
  const errors = {};
  fields.forEach((key) => {
    const err = validateContactField(key, form[key]);
    if (err) errors[key] = err;
  });
  return errors;
}
