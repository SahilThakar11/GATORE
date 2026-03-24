import React, { useState, useRef } from "react";

type ButtonSize = "small" | "medium" | "large";

interface TertiaryButtonProps {
  label: string;
  onClick?: () => void;
  size?: ButtonSize;
  disabled?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  noHoverBg?: boolean;
}

const SIZE_STYLES: Record<
  ButtonSize,
  { sizeClass: string; spinnerSize: number }
> = {
  small:  { sizeClass: "py-2 px-4 text-sm",                                  spinnerSize: 14 },
  medium: { sizeClass: "py-2 px-4 text-sm sm:py-2.5 sm:px-6 sm:text-base",   spinnerSize: 16 },
  large:  { sizeClass: "py-2 px-4 text-sm sm:py-3.5 sm:px-7 sm:text-lg",     spinnerSize: 18 },
};

export function TertiaryButton({
  label,
  onClick,
  size = "medium",
  disabled = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  noHoverBg = false,
}: TertiaryButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(false);
  const mouseDownRef = useRef(false);

  // isLoading takes priority over disabled
  const isInert = isLoading || disabled;

  const bg = (() => {
    if (isInert || noHoverBg) return "transparent";
    if (active)  return "#CCFBF1";
    if (hovered) return "#F0FDFA";
    return "transparent";
  })();

  const textColor = isInert && !isLoading ? "#D6D3D1" : "#0F766E";

  const { sizeClass, spinnerSize } = SIZE_STYLES[size];

  return (
    <button
      onClick={isInert ? undefined : onClick}
      disabled={isInert}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setActive(false); }}
      onFocus={() => { if (!mouseDownRef.current) setFocused(true); }}
      onBlur={() => { setFocused(false); mouseDownRef.current = false; }}
      onMouseDown={() => { mouseDownRef.current = true; setActive(true); }}
      onMouseUp={() => setActive(false)}
      className={sizeClass}
      style={{
        borderRadius: "8px",
        gap: "10px",
        fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif",
        backgroundColor: bg,
        color: textColor,
        border: "none",
        outline: focused ? "2px solid #0F766E" : undefined,
        outlineOffset: focused ? "3px" : undefined,
        cursor: isInert ? "not-allowed" : "pointer",
        pointerEvents: isInert ? "none" : undefined,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background-color 150ms",
      }}
    >
      {isLoading ? (
        <svg
          style={{ width: spinnerSize, height: spinnerSize, flexShrink: 0, color: "#0F766E" }}
          className="animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            opacity={0.25}
          />
          <path
            fill="currentColor"
            opacity={0.75}
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : leftIcon && (
        <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          {leftIcon}
        </span>
      )}
      {isLoading ? "Loading..." : label}
      {!isLoading && rightIcon && (
        <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          {rightIcon}
        </span>
      )}
    </button>
  );
}
