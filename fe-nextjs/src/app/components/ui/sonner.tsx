"use client";

import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-center"
      closeButton
      expand={false}
      visibleToasts={4}
      toastOptions={{
        classNames: {
          toast:
            "animate-[var(--animate-slide-down)] rounded-[var(--radius-input)] border border-brand-yellow/30 bg-brand-beige text-brand-brown shadow-[var(--shadow-wood)]",
          title: "text-sm font-semibold text-brand-brown",
          description: "text-sm text-brand-gray-700",
          success: "bg-brand-green/10 border-brand-green/30 text-brand-green",
          error: "bg-brand-danger/10 border-brand-danger/30 text-brand-danger",
          closeButton:
            "bg-white text-brand-brown border border-brand-yellow/40 hover:bg-brand-yellow/10",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
