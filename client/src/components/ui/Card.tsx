import React from "react";

interface CardProps {
  children: React.ReactNode;
  variant?: "default" | "elevated" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = "default",
  padding = "md",
  className = "",
  onClick,
}) => {
  const variants = {
    default: "bg-warm-50 border border-warm-200",
    elevated: "bg-white shadow-md",
    outlined: "bg-white border-2 border-gray-200",
  };

  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-5",
    lg: "p-6",
  };

  const clickable = onClick
    ? "cursor-pointer hover:shadow-lg transition-shadow"
    : "";

  return (
    <div
      className={`rounded-lg ${variants[variant]} ${paddings[padding]} ${clickable} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
