import React from 'react';
import { cn } from '../../../utils/cn';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
  const variants = {
    default: 'bg-brand-gray-100 text-brand-gray-700',
    success: 'bg-brand-green/10 text-brand-green',
    warning: 'bg-brand-amber/10 text-brand-amber',
    danger: 'bg-brand-danger/10 text-brand-danger',
    info: 'bg-brand-yellow/10 text-brand-brown',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full font-medium',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
