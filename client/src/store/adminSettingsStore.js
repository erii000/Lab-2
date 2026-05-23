import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createInitialSettings } from "../utils/adminSettings.js";

export const useAdminSettingsStore = create(
  persist(
    (set, get) => ({
      settings: createInitialSettings(),
      lastSavedAt: null,
      saving: false,

      updateSection: (section, patch) => {
        set((s) => ({
          settings: { ...s.settings, [section]: { ...s.settings[section], ...patch } },
        }));
        get().autosave();
      },

      autosave: () => {
        set({ saving: true });
        setTimeout(() => {
          set({ saving: false, lastSavedAt: Date.now() });
        }, 350);
      },
    }),
    { name: "sta-admin-settings-v2", partialize: (s) => ({ settings: s.settings }) },
  ),
);
