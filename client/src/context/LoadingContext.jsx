import { createContext, useCallback, useContext, useMemo, useState } from "react";

const LoadingContext = createContext(null);

export function LoadingProvider({ children }) {
  const [activeRequests, setActiveRequests] = useState(0);

  const startLoading = useCallback(() => {
    setActiveRequests((current) => current + 1);
  }, []);

  const stopLoading = useCallback(() => {
    setActiveRequests((current) => Math.max(0, current - 1));
  }, []);

  const runWithLoader = useCallback(
    async (asyncAction) => {
      startLoading();
      try {
        return await asyncAction();
      } finally {
        stopLoading();
      }
    },
    [startLoading, stopLoading],
  );

  const value = useMemo(
    () => ({
      activeRequests,
      isLoading: activeRequests > 0,
      startLoading,
      stopLoading,
      runWithLoader,
    }),
    [activeRequests, runWithLoader, startLoading, stopLoading],
  );

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider.");
  }
  return context;
}
