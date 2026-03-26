import React, { useState } from "react";
import { X, type LucideIcon } from "lucide-react";
import { variantTokens, type AlertVariant } from "./alertVariants";

export interface AlertBannerProps {
  variant: AlertVariant;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Overrides the variant's default icon. */
  icon?: LucideIcon;
  /** Renders an × button that hides the banner when clicked. */
  dismissible?: boolean;
  /** Called when the × button is clicked. If omitted the banner self-manages visibility. */
  onDismiss?: () => void;
  className?: string;
}

/**
 * AlertBanner
 *
 * Inline, full-width alert for page-level messages.
 *
 * @example
 * // Uncontrolled (self-dismissing)
 * <AlertBanner
 *   variant="success"
 *   title="Reservation confirmed!"
 *   description="We've sent a confirmation to your email."
 *   dismissible
 * />
 *
 * @example
 * // Controlled
 * const [show, setShow] = useState(true);
 * {show && (
 *   <AlertBanner
 *     variant="error"
 *     title="Payment failed"
 *     description="Please check your card details and try again."
 *     dismissible
 *     onDismiss={() => setShow(false)}
 *   />
 * )}
 */
export const AlertBanner: React.FC<AlertBannerProps> = ({
  variant,
  title,
  description,
  icon,
  dismissible = false,
  onDismiss,
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

  const { bg, leftBorder, thinBorder, iconClass, titleClass, descriptionClass, dismissClass, Icon: VariantIcon } =
    variantTokens[variant];
  const Icon = icon ?? VariantIcon;

  return (
    <div
      role="alert"
      className={[
        "w-full flex items-start gap-3 p-4",
        "rounded-[10px] border border-l-4",
        bg,
        thinBorder,
        leftBorder,
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
