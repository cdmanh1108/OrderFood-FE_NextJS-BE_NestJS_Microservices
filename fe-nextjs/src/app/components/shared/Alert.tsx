import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';
import { cn } from '../../../utils/cn';

export interface AlertProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export function Alert({ variant = 'info', title, message, onClose, className }: AlertProps) {
  const variants = {
    success: {
      container: 'bg-brand-green/10 border-brand-green/20',
      icon: <CheckCircle className="text-brand-green" size={20} />,
      text: 'text-brand-green',
    },
    error: {
      container: 'bg-brand-danger/10 border-brand-danger/20',
      icon: <XCircle className="text-brand-danger" size={20} />,
      text: 'text-brand-danger',
    },
    warning: {
      container: 'bg-brand-amber/10 border-brand-amber/20',
      icon: <AlertCircle className="text-brand-amber" size={20} />,
      text: 'text-brand-amber',
    },
    info: {
      container: 'bg-brand-yellow/10 border-brand-yellow/20',
      icon: <Info className="text-brand-brown" size={20} />,
      text: 'text-brand-brown',
    },
  };

  const config = variants[variant];

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-[var(--radius-input)] border',
        config.container,
        className
      )}
    >
      <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={cn('font-semibold mb-1', config.text)}>{title}</h4>
        )}
        <p className={cn('text-sm', config.text)}>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={cn('flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors', config.text)}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
