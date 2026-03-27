import React, { useState, useRef } from "react";

type ButtonSize = "xs" | "sm" | "md" | "lg";

interface PrimaryButtonProps {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  size?: ButtonSize;
  rightIcon?: React.ReactNode;
  /** Use gray-300/gray-500 for the disabled state instead of the default white */
  grayDisabled?: boolean;
  "aria-expanded"?: boolean;
  "aria-haspopup"?: boolean | "menu" | "listbox" | "tree" | "grid" | "dialog";
}

const SHADOW_DEFAULT = "0px 4px 14px 0px rgba(15,118,110,0.25)";

const SIZE_STYLES: Record<
  ButtonSize,
  { sizeClass: string; spinnerSize: number }
> = {
  xs: { sizeClass: "py-2 px-3 text-xs",                                    spinnerSize: 12 },
  sm: { sizeClass: "py-3 px-4 text-sm",                                    spinnerSize: 14 },
  md: { sizeClass: "py-3 px-4 text-sm sm:px-6 sm:text-base",               spinnerSize: 16 },
  lg: { sizeClass: "py-3 px-4 text-sm sm:py-3.5 sm:px-7 sm:text-lg",       spinnerSize: 18 },
};

export function PrimaryButton({
  label,
  onClick,
  disabled = false,
  isLoading = false,
  size = "md",
  rightIcon,
  grayDisabled = false,
  "aria-expanded": ariaExpanded,
  "aria-haspopup": ariaHaspopup,
}: PrimaryButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [active, setActive] = useState(false);
  const mouseDownRef = useRef(false);

  // isLoading takes priority over disabled
  const isInert = isLoading || disabled;

  const shadow = (focused || active || isInert) ? "none"
    : hovered ? "0px 4px 14px 0px rgba(17,94,89,0.25)"
    : SHADOW_DEFAULT;

  const bg = (() => {
    if (isLoading) return "#FFFFFF";
    if (disabled)  return grayDisabled ? "#D1D5DB" : "#FFFFFF";
    if (active)    return "#CCFBF1";
    if (hovered)   return "#115E59";
    if (focused)   return "#FFFFFF";
    return "#0F766E";
  })();

  const borderColor = (() => {
    if (isLoading) return "#0F766E";
    if (disabled)  return grayDisabled ? "#D1D5DB" : "#D6D3D1";
    if (active)    return "#134E4A";
    if (hovered)   return "#115E59";
    if (focused)   return "#0F766E";
    return "transparent";
  })();

  const textColor = (() => {
    if (isLoading) return "#0F766E";
    if (disabled)  return grayDisabled ? "#6B7280" : "#78716C";
    if (active)    return "#134E4A";
    if (hovered)   return "#FFFFFF";
    if (focused)   return "#0F766E";
    return "#FFFFFF";
  })();

  const { sizeClass, spinnerSize } = SIZE_STYLES[size];

  return (
    <button
      onClick={isInert ? undefined : onClick}
      disabled={isInert}
      aria-expanded={ariaExpanded}
      aria-haspopup={ariaHaspopup}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setActive(false);
      }}
      onFocus={() => { if (!mouseDownRef.current) setFocused(true); }}
      onBlur={() => { setFocused(false); mouseDownRef.current = false; }}
      onMouseDown={() => { mouseDownRef.current = true; setActive(true); }}
      onMouseUp={() => setActive(false)}
      className={sizeClass}
      style={{
        borderRadius: "8px",
        gap: "8px",
        fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif",
        backgroundColor: bg,
        color: textColor,
        boxShadow: shadow,
        border: `1px solid ${borderColor}`,
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
      {isLoading && (
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
      )}
      {isLoading ? "Loading..." : label}
      {!isLoading && rightIcon}
    </button>
  );
}
