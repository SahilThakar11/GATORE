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
      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
      : "bg-teal-500 text-white hover:bg-teal-600 focus:ring-teal-500",
    secondary: disabled
      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
      : "bg-amber-900 text-white hover:bg-amber-950 focus:ring-amber-900",
    outline: disabled
      ? "border-2 border-gray-200 text-gray-400 cursor-not-allowed"
      : "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300",
    ghost: disabled
      ? "text-gray-400 cursor-not-allowed"
      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:ring-gray-300",
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
