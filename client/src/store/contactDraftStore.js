import { create } from "zustand";
import { persist } from "zustand/middleware";

const LEGACY_STORAGE_KEY = "sta-contact-form-draft-v1";

export const defaultContactDraft = {
  fullName: "",
  email: "",
  subject: "",
  bookingId: "",
  message: "",
  tripType: "leisure",
  priority: "standard",
};

function readLegacyDraft() {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return null;
    return { ...defaultContactDraft, ...JSON.parse(raw) };
  } catch {
    return null;
  }
}

export const useContactDraftStore = create(
  persist(
    (set) => ({
      draft: { ...defaultContactDraft },

      setDraft: (draftOrUpdater) =>
        set((state) => ({
          draft:
            typeof draftOrUpdater === "function"
              ? draftOrUpdater(state.draft)
              : { ...state.draft, ...draftOrUpdater },
        })),

      resetDraft: () => set({ draft: { ...defaultContactDraft } }),
    }),
    {
      name: "sta-contact-draft-v1",
      version: 1,
      partialize: (state) => ({ draft: state.draft }),
      onRehydrateStorage: () => (state, error) => {
        if (error || !state) return;
        const hasContent = Object.entries(state.draft ?? {}).some(
          ([key, value]) => key !== "tripType" && key !== "priority" && String(value).trim(),
        );
        if (hasContent) return;
        const legacy = readLegacyDraft();
        if (legacy) {
          useContactDraftStore.setState({ draft: legacy });
          try {
            localStorage.removeItem(LEGACY_STORAGE_KEY);
          } catch {
            /* ignore */
          }
        }
      },
    },
  ),
);
