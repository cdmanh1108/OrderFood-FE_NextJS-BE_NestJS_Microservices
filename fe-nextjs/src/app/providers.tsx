"use client";

import { AuthProvider } from "../contexts/auth-context";
import { GlobalAppFeedback } from "./components/shared/GlobalAppFeedback";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <GlobalAppFeedback />
    </AuthProvider>
  );
}
