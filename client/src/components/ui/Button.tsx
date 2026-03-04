import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const baseStyles =
    "font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary: disabled
      ? "bg-warm-200 text-neutral-600 cursor-not-allowed"
      : "bg-teal-500 text-white hover:bg-teal-600 focus:ring-teal-500 cursor-pointer",
    secondary: disabled
      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
      : "bg-amber-900 text-white hover:bg-amber-950 focus:ring-amber-900 cursor-pointer",
    outline: disabled
      ? "border-2 border-warm-200 bg-white text-neutral-600 cursor-not-allowed"
      : "border-2 border-warm-200 bg-white text-neutral-600 focus:ring-warm-300 cursor-pointer",
    ghost: disabled
      ? "text-gray-400 cursor-not-allowed"
      : "text-gray-600 hover:text-gray-900 focus:ring-warm-300 cursor-pointer",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};
