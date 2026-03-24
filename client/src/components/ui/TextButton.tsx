import React, { useState, useRef } from "react";

type ButtonSize = "xs" | "small" | "medium" | "large";

interface TextButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const SIZE_STYLES: Record<
  ButtonSize,
  { padding: string; fontSize: string; spinnerSize: number }
> = {
  xs:    { padding: "2px 6px",  fontSize: "12px", spinnerSize: 12 },
  small: { padding: "8px 16px", fontSize: "14px", spinnerSize: 14 },
  medium: { padding: "10px 24px", fontSize: "16px", spinnerSize: 16 },
  large: { padding: "14px 28px", fontSize: "18px", spinnerSize: 18 },
};

export function TextButton({
  label,
  onClick,
  disabled = false,
  isLoading = false,
  size = "medium",
  leftIcon,
  rightIcon,
}: TextButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(false);
  const mouseDownRef = useRef(false);

  const isInert = isLoading || disabled;

  const color =
    isInert && !isLoading
      ? "#D6D3D1"
      : active
        ? "#0C4A6E"
        : hovered
          ? "#115E59"
          : "#0F766E";

  const { padding, fontSize, spinnerSize } = SIZE_STYLES[size];

  return (
    <button
      onClick={isInert ? undefined : onClick}
      disabled={isInert}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setActive(false);
      }}
      onFocus={() => {
        if (!mouseDownRef.current) setFocused(true);
      }}
      onBlur={() => {
        setFocused(false);
        mouseDownRef.current = false;
      }}
      onMouseDown={() => {
        mouseDownRef.current = true;
        setActive(true);
      }}
      onMouseUp={() => setActive(false)}
      style={{
        padding,
        fontSize,
        borderRadius: "8px",
        gap: "8px",
        fontWeight: hovered || active ? 700 : 600,
        fontVariationSettings: hovered || active ? "'wght' 700" : "'wght' 600",
        fontFamily: "'DM Sans', sans-serif",
        backgroundColor: "transparent",
        color,
        border: "none",
        outline: focused ? "2px solid #0F766E" : undefined,
        outlineOffset: focused ? "3px" : undefined,
        cursor: isInert ? "not-allowed" : "pointer",
        pointerEvents: isInert ? "none" : undefined,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "color 150ms, font-variation-settings 150ms",
      }}
    >
      {isLoading ? (
        <svg
          style={{
            width: spinnerSize,
            height: spinnerSize,
            flexShrink: 0,
            color: "#0F766E",
          }}
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
      ) : (
        leftIcon && (
          <span
            style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
          >
            {leftIcon}
          </span>
        )
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
