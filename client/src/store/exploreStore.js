import { create } from "zustand";
import { persist } from "zustand/middleware";

const LEGACY_RECENT_KEY = "sta_recent_explore";

function buildRecentLabel(criteria) {
  return [criteria.destination, criteria.budget ? `€${criteria.budget}` : null]
    .filter(Boolean)
    .join(" · ");
}

function readLegacyRecent() {
  try {
    const raw = localStorage.getItem(LEGACY_RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const useExploreStore = create(
  persist(
    (set) => ({
      recentSearches: [],

      pushRecentSearch: (criteria) => {
        const label = buildRecentLabel(criteria);
        if (!label) return;
        const entry = { label, criteria, at: Date.now() };
        set((state) => ({
          recentSearches: [entry, ...state.recentSearches.filter((r) => r.label !== label)].slice(0, 5),
        }));
      },
    }),
    {
      name: "sta-explore-v1",
      version: 1,
      partialize: (state) => ({ recentSearches: state.recentSearches }),
      onRehydrateStorage: () => (state, error) => {
        if (error || !state) return;
        if (state.recentSearches?.length) return;
        const legacy = readLegacyRecent();
        if (legacy.length) {
          useExploreStore.setState({ recentSearches: legacy });
          try {
            localStorage.removeItem(LEGACY_RECENT_KEY);
          } catch {
            /* ignore */
          }
        }
      },
    },
  ),
);

/** Non-reactive read for utilities */
export function getRecentSearches() {
  return useExploreStore.getState().recentSearches;
}
