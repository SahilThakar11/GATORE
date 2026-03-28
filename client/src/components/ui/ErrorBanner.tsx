import { AlertCircle, X } from "lucide-react";

interface ErrorBannerProps {
  message: string;
  onDismiss: () => void;
}

export function ErrorBanner({ message, onDismiss }: ErrorBannerProps) {
  return (
    <div role="alert" className="mx-5 mt-3 flex items-start gap-2.5 bg-red-50 border border-red-200 text-red-700 rounded-lg px-3.5 py-2.5">
      <AlertCircle size={16} aria-hidden="true" className="shrink-0 mt-0.5" />
      <p className="text-sm flex-1 leading-snug">{message}</p>
      <button
        onClick={onDismiss}
        aria-label="Dismiss error"
        className="shrink-0 text-red-400 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
