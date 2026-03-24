import { CheckCircle2, XCircle, AlertTriangle, Info, type LucideIcon } from "lucide-react";

export type AlertVariant = "success" | "error" | "warning" | "info";

export interface VariantTokens {
  bg: string;
  leftBorder: string;   // AlertBanner: 4px left border colour
  thinBorder: string;   // AlertBanner: 1px top/right/bottom border colour
  fullBorder: string;   // ToastNotification: 2px full border colour
  iconClass: string;
  titleClass: string;
  descriptionClass: string;
  dismissClass: string;
  Icon: LucideIcon;
}

export const variantTokens: Record<AlertVariant, VariantTokens> = {
  success: {
    bg:           "bg-green-50",
    leftBorder:   "border-l-green-500",
    thinBorder:   "border-green-200",
    fullBorder:   "border-green-500",
    iconClass:    "text-green-600",
    titleClass:   "text-green-800",
    descriptionClass: "text-green-700",
    dismissClass: "text-green-600 hover:text-green-800",
    Icon:         CheckCircle2,
  },
  error: {
    bg:           "bg-red-50",
    leftBorder:   "border-l-red-500",
    thinBorder:   "border-red-200",
    fullBorder:   "border-red-500",
    iconClass:    "text-red-500",
    titleClass:   "text-red-800",
    descriptionClass: "text-red-700",
    dismissClass: "text-red-600 hover:text-red-800",
    Icon:         XCircle,
  },
  warning: {
    bg:           "bg-amber-50",
    leftBorder:   "border-l-amber-500",
    thinBorder:   "border-amber-200",
    fullBorder:   "border-amber-500",
    iconClass:    "text-amber-700",
    titleClass:   "text-amber-800",
    descriptionClass: "text-amber-700",
    dismissClass: "text-amber-600 hover:text-amber-800",
    Icon:         AlertTriangle,
  },
  info: {
    bg:           "bg-blue-50",
    leftBorder:   "border-l-blue-500",
    thinBorder:   "border-blue-200",
    fullBorder:   "border-blue-500",
    iconClass:    "text-blue-500",
    titleClass:   "text-blue-800",
    descriptionClass: "text-blue-700",
    dismissClass: "text-blue-600 hover:text-blue-800",
    Icon:         Info,
  },
};