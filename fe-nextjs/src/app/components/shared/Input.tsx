import React from 'react';
import { cn } from '../../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substring(7)}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block mb-2 text-brand-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full px-4 py-2.5 bg-white border rounded-[var(--radius-input)] transition-all duration-200',
              'text-brand-gray-900 placeholder:text-brand-gray-400',
              'focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent',
              'disabled:bg-brand-gray-100 disabled:cursor-not-allowed disabled:text-brand-gray-500',
              'shadow-[var(--shadow-input)]',
              error && 'border-brand-danger focus:ring-brand-danger',
              !error && 'border-brand-gray-200',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-brand-danger">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-brand-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
