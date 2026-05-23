import { defaultContactDraft, useContactDraftStore } from "../store/contactDraftStore.js";

/** @deprecated Prefer useContactDraftStore — kept for backward compatibility */
export function loadContactDraft() {
  return { ...defaultContactDraft, ...useContactDraftStore.getState().draft };
}

/** @deprecated Prefer useContactDraftStore */
export function saveContactDraft(draft) {
  useContactDraftStore.getState().setDraft(draft);
}

/** @deprecated Prefer useContactDraftStore */
export function clearContactDraft() {
  useContactDraftStore.getState().resetDraft();
}
