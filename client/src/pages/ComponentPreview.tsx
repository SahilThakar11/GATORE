import { useState } from "react";
import { AlertBanner } from "../components/ui/AlertBanner";
import { ToastNotification, type ToastPosition } from "../components/ui/ToastNotification";

type Variant = "success" | "error" | "warning" | "info";

const VARIANTS: Variant[] = ["success", "error", "warning", "info"];

const VARIANT_LABELS: Record<Variant, string> = {
  success: "Success",
  error: "Error",
  warning: "Warning",
  info: "Info",
};

const EXAMPLE_TITLES: Record<Variant, string> = {
  success: "Reservation confirmed!",
  error: "Booking failed",
  warning: "Session expiring soon",
  info: "New time slots available",
};

const EXAMPLE_DESCRIPTIONS: Record<Variant, string> = {
  success: "We've sent a confirmation to your email address.",
  error: "Something went wrong while processing your payment. Please try again.",
  warning: "You'll be signed out in 5 minutes due to inactivity.",
  info: "3 new time slots have opened up for your selected date.",
};

const TOAST_POSITIONS: ToastPosition[] = [
  "bottom-right",
  "bottom-left",
  "top-right",
  "top-left",
];

export default function ComponentPreview() {
  const [activeToast, setActiveToast] = useState<{
    variant: Variant;
    position: ToastPosition;
  } | null>(null);

  const triggerToast = (variant: Variant, position: ToastPosition) => {
    setActiveToast({ variant, position });
  };

  return (
    <div className="min-h-screen bg-warm-100 font-['DM_Sans'] p-8">
      <div className="max-w-3xl mx-auto space-y-12">

        {/* Page header */}
        <div>
          <p className="text-xs font-semibold text-teal-700 uppercase tracking-widest mb-1">
            Design System
          </p>
          <h1 className="text-3xl font-black text-neutral-800">
            Component Preview
          </h1>
          <p className="text-sm text-neutral-600 mt-1">
            AlertBanner &amp; ToastNotification — all variants
          </p>
        </div>

        {/* ── AlertBanner ──────────────────────────────────────────────── */}
        <section className="space-y-6">
          <div className="border-b border-warm-300 pb-2">
            <h2 className="text-lg font-bold text-neutral-800">AlertBanner</h2>
            <p className="text-xs text-neutral-600 mt-0.5">
              Inline, full-width — use for page-level feedback
            </p>
          </div>

          {/* Title only */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
              Title only
            </p>
            <div className="space-y-3">
              {VARIANTS.map((v) => (
                <AlertBanner
                  key={v}
                  variant={v}
                  title={EXAMPLE_TITLES[v]}
                />
              ))}
            </div>
          </div>

          {/* Title + description */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
              Title + description
            </p>
            <div className="space-y-3">
              {VARIANTS.map((v) => (
                <AlertBanner
                  key={v}
                  variant={v}
                  title={EXAMPLE_TITLES[v]}
                  description={EXAMPLE_DESCRIPTIONS[v]}
                />
              ))}
            </div>
          </div>

          {/* Dismissible */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
              Dismissible
            </p>
            <p className="text-xs text-neutral-600">
              Click × to dismiss. Refresh to reset.
            </p>
            <div className="space-y-3">
              {VARIANTS.map((v) => (
                <AlertBanner
                  key={v}
                  variant={v}
                  title={EXAMPLE_TITLES[v]}
                  description={EXAMPLE_DESCRIPTIONS[v]}
                  dismissible
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── ToastNotification ────────────────────────────────────────── */}
        <section className="space-y-6">
          <div className="border-b border-warm-300 pb-2">
            <h2 className="text-lg font-bold text-neutral-800">
              ToastNotification
            </h2>
            <p className="text-xs text-neutral-600 mt-0.5">
              Fixed floating notification — click a button to preview in each
              position
            </p>
          </div>

          {VARIANTS.map((v) => (
            <div key={v} className="space-y-2">
              <p className="text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                {VARIANT_LABELS[v]}
              </p>
              <p className="text-xs text-neutral-600">
                {EXAMPLE_TITLES[v]} — {EXAMPLE_DESCRIPTIONS[v]}
              </p>
              <div className="flex flex-wrap gap-2">
                {TOAST_POSITIONS.map((pos) => (
                  <button
                    key={pos}
                    onClick={() => triggerToast(v, pos)}
                    className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-warm-300 bg-white text-neutral-700 hover:border-teal-400 hover:text-teal-700 transition-colors cursor-pointer"
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>

        <p className="text-xs text-neutral-600 pb-8">
          Route:{" "}
          <code className="bg-warm-200 px-1.5 py-0.5 rounded text-neutral-800">
            /component-preview
          </code>
        </p>
      </div>

      {/* Active toast */}
      {activeToast && (
        <ToastNotification
          key={`${activeToast.variant}-${activeToast.position}`}
          variant={activeToast.variant}
          title={EXAMPLE_TITLES[activeToast.variant]}
          description={EXAMPLE_DESCRIPTIONS[activeToast.variant]}
          position={activeToast.position}
          dismissible
          onDismiss={() => setActiveToast(null)}
        />
      )}
    </div>
  );
}
