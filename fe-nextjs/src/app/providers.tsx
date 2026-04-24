"use client";

import { AuthProvider } from "../contexts/auth-context";
import { CartProvider } from "../contexts/cart-context";
import { GlobalAppFeedback } from "./components/shared/GlobalAppFeedback";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>{children}</CartProvider>
      <GlobalAppFeedback />
    </AuthProvider>
  );
}
