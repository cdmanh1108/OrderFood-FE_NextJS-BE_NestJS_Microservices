import React from 'react';
import { cn } from '../../../utils/cn';

export interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  fullScreen?: boolean;
}

export function LoadingOverlay({ isLoading, text = 'Đang tải...', fullScreen = false }: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center bg-brand-beige/70 backdrop-blur-sm z-50',
        fullScreen ? 'fixed inset-0' : 'absolute inset-0'
      )}
    >
      <div className="flex flex-col items-center gap-3 px-6 py-5 rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-wood)] border border-brand-yellow/30">
        <div className="relative w-11 h-11">
          <span className="absolute inset-0 rounded-full border-4 border-brand-yellow/40" />
          <span className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-brown border-r-brand-amber animate-spin" />
        </div>
        <p className="text-sm text-brand-brown font-semibold">{text}</p>
      </div>
    </div>
  );
}
