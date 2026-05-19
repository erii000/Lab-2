const STORAGE_KEY = "sta-contact-form-draft-v1";

const defaultDraft = {
  fullName: "",
  email: "",
  subject: "",
  bookingId: "",
  message: "",
  tripType: "leisure",
  priority: "standard",
};

export function loadContactDraft() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultDraft };
    return { ...defaultDraft, ...JSON.parse(raw) };
  } catch {
    return { ...defaultDraft };
  }
}

export function saveContactDraft(draft) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* quota or private mode */
  }
}

export function clearContactDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
