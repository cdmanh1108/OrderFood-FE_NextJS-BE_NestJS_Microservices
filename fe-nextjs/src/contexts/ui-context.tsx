import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";

export type StatusType = "success" | "error";

export interface StatusMessage {
  id: number;
  type: StatusType;
  message: string;
}

interface UIContextType {
  isLoading: boolean;
  loadingMessage: string;
  status: StatusMessage | null;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  setSuccess: (message: string) => void;
  setError: (message: string) => void;
  clearStatus: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Đang tải...");
  const [status, setStatus] = useState<StatusMessage | null>(null);

  const startLoading = useCallback((message = "Đang tải...") => {
    setIsLoading(true);
    setLoadingMessage(message);
  }, []);

  const stopLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingMessage("Đang tải...");
  }, []);

  const setSuccess = useCallback((message: string) => {
    setStatus({
      id: Date.now(),
      type: "success",
      message,
    });
  }, []);

  const setError = useCallback((message: string) => {
    setStatus({
      id: Date.now(),
      type: "error",
      message,
    });
  }, []);

  const clearStatus = useCallback(() => {
    setStatus(null);
  }, []);

  return (
    <UIContext.Provider
      value={{
        isLoading,
        loadingMessage,
        status,
        startLoading,
        stopLoading,
        setSuccess,
        setError,
        clearStatus,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error("useUI must be used within a UIProvider");
  }
  return context;
}
