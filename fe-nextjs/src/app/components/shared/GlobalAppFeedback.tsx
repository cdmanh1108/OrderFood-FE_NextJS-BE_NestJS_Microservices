"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useUI } from "../../../contexts/ui-context";
import { Toaster } from "../ui/sonner";
import { LoadingOverlay } from "./LoadingOverlay";

export function GlobalAppFeedback() {
  const { isLoading, loadingMessage, status, clearStatus } = useUI();

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

