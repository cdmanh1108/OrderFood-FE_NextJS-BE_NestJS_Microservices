"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useUIStore } from "../../../stores/ui-store";
import { Toaster } from "../ui/sonner";
import { LoadingOverlay } from "./LoadingOverlay";

export function GlobalAppFeedback() {
  const { isLoading, loadingMessage, status, clearStatus } = useUIStore();

  useEffect(() => {
    if (!status) return;

    if (status.type === "success") {
      toast.success(status.message, { id: status.id });
    } else {
      toast.error(status.message, { id: status.id });
    }

    clearStatus();
  }, [status, clearStatus]);

  return (
    <>
      <Toaster />
      <LoadingOverlay isLoading={isLoading} text={loadingMessage} fullScreen />
    </>
  );
}

