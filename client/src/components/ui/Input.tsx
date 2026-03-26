import React, { forwardRef, useState } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  emptyBg?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, helperText, leftIcon, rightIcon, emptyBg = "bg-warm-50", className = "", onFocus, onBlur, ...props },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const isFilled = !isFocused && Boolean(props.value);

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-xs sm:text-sm font-medium text-neutral-800">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            className={`w-full px-4 py-3 text-sm sm:text-base border rounded-lg transition-colors focus:outline-none focus:ring-2 ${
              error
                ? "bg-red-50 border-red-300 focus:ring-red-600"
                : isFilled
                  ? "bg-teal-50 border-warm-300 focus:ring-teal-500"
                  : `${emptyBg} border-warm-300 focus:ring-teal-500`
            } ${leftIcon ? "pl-10" : ""} ${rightIcon ? "pr-12" : ""} ${className}`}
            onFocus={(e) => { setIsFocused(true); onFocus?.(e); }}
            onBlur={(e) => { setIsFocused(false); onBlur?.(e); }}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && <p role="alert" className="text-xs sm:text-sm text-red-600">{error}</p>}

        {helperText && !error && (
          <p className="text-xs sm:text-sm text-neutral-500">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
