import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAssistantStore = create(
  persist(
    (set) => ({
      query: "",
      plan: null,
      lastGeneratedAt: null,

      setQuery: (query) => set({ query }),

      setPlan: (plan) =>
        set({
          plan,
          lastGeneratedAt: plan ? Date.now() : null,
        }),

      clearPlan: () => set({ plan: null, lastGeneratedAt: null }),
    }),
    {
      name: "sta-assistant-v1",
      version: 1,
      partialize: (state) => ({
        query: state.query,
        plan: state.plan,
        lastGeneratedAt: state.lastGeneratedAt,
      }),
    },
  ),
);
