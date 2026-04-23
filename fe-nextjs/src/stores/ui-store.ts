import { create } from "zustand";

export type StatusType = "success" | "error";

export interface StatusMessage {
  id: number;
  type: StatusType;
  message: string;
}

interface UIStoreState {
  isLoading: boolean;
  loadingMessage: string;
  status: StatusMessage | null;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  setSuccess: (message: string) => void;
  setError: (message: string) => void;
  clearStatus: () => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  isLoading: false,
  loadingMessage: "Đang tải...",
  status: null,
  startLoading: (message = "Đang tải...") =>
    set({
      isLoading: true,
      loadingMessage: message,
    }),
  stopLoading: () =>
    set({
      isLoading: false,
      loadingMessage: "Đang tải...",
    }),
  setSuccess: (message) =>
    set({
      status: {
        id: Date.now(),
        type: "success",
        message,
      },
    }),
  setError: (message) =>
    set({
      status: {
        id: Date.now(),
        type: "error",
        message,
      },
    }),
  clearStatus: () =>
    set({
      status: null,
    }),
}));

