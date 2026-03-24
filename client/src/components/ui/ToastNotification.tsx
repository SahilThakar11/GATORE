import React, { useState } from "react";
import { X } from "lucide-react";
import { variantTokens, type AlertVariant } from "./alertVariants";

export type ToastPosition =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";

const positionClasses: Record<ToastPosition, string> = {
  "bottom-right": "bottom-6 right-6",
  "bottom-left":  "bottom-6 left-6",
  "top-right":    "top-6 right-6",
  "top-left":     "top-6 left-6",
};

export interface ToastNotificationProps {
  variant: AlertVariant;
  title: string;
  description?: string;
  /** Renders an × button that hides the toast when clicked. */
  dismissible?: boolean;
  /** Called when the × button is clicked. If omitted the toast self-manages visibility. */
  onDismiss?: () => void;
  position?: ToastPosition;
  className?: string;
}

/**
 * ToastNotification
 *
 * Floating notification fixed to a corner of the viewport.
 *
 * @example
 * // Uncontrolled (self-dismissing)
 * <ToastNotification
 *   variant="info"
 *   title="Game added"
 *   description="Catan has been added to your library."
 *   dismissible
 * />
 *
 * @example
 * // Controlled with custom position
 * const [show, setShow] = useState(false);
 * {show && (
 *   <ToastNotification
 *     variant="warning"
 *     title="Session expiring"
 *     description="You'll be signed out in 5 minutes."
 *     position="top-right"
 *     dismissible
 *     onDismiss={() => setShow(false)}
 *   />
 * )}
 */
export const ToastNotification: React.FC<ToastNotificationProps> = ({
  variant,
  title,
  description,
  dismissible = false,
  onDismiss,
  position = "bottom-right",
  className = "",
}) => {
  const [visible, setVisible] = useState(true);

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    } else {
      setVisible(false);
    }
  };

  if (!visible) return null;

  const { bg, fullBorder, iconClass, titleClass, descriptionClass, dismissClass, Icon } =
    variantTokens[variant];

  return (
    <div
      role="alert"
      aria-live="polite"
      className={[
        "fixed z-50 flex items-start gap-3 p-4",
        "min-w-80 max-w-[420px]",
        "rounded-[10px] border-2",
        "shadow-lg",
        bg,
        fullBorder,
        positionClasses[position],
        className,
      ].join(" ")}
    >
      {/* Icon */}
      <Icon size={20} className={`shrink-0 mt-0.5 ${iconClass}`} />

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-bold leading-snug ${titleClass}`}>{title}</p>
        {description && (
          <p className={`text-xs mt-0.5 leading-snug ${descriptionClass}`}>{description}</p>
        )}
      </div>

      {/* Dismiss button */}
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          className={`shrink-0 transition-colors cursor-pointer rounded focus:outline-none focus:ring-2 focus:ring-offset-1 ${dismissClass}`}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};
