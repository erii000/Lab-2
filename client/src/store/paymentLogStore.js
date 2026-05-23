import { create } from "zustand";
import { persist } from "zustand/middleware";

export const usePaymentLogStore = create(
  persist(
    (set, get) => ({
      transactions: [],

      logTransaction: (entry) => {
        const record = {
          id: `pay_${Date.now().toString(36)}`,
          createdAt: new Date().toISOString(),
          status: entry.status ?? "pending",
          ...entry,
        };
        set((s) => ({ transactions: [record, ...s.transactions].slice(0, 200) }));
        return record;
      },

      getByBookingId: (bookingId) =>
        get().transactions.filter((t) => t.bookingId === bookingId),

      getRecent: (limit = 10) => get().transactions.slice(0, limit),
    }),
    {
      name: "sta-payment-log-v1",
      version: 1,
      partialize: (s) => ({ transactions: s.transactions }),
    },
  ),
);
