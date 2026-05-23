import { LinearProgress } from "@mui/material";
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

  const isLoading = activeRequests > 0;

  const value = useMemo(
    () => ({
      activeRequests,
      isLoading,
      startLoading,
      stopLoading,
      runWithLoader,
    }),
    [activeRequests, isLoading, runWithLoader, startLoading, stopLoading],
  );

  return (
    <LoadingContext.Provider value={value}>
      {isLoading ? (
        <LinearProgress
          color="primary"
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: (theme) => theme.zIndex.tooltip + 2,
            height: 2,
          }}
        />
      ) : null}
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within LoadingProvider.");
  }
  return context;
}
