import { useState } from "react";
import { Save, Loader2, ChevronLeft } from "lucide-react";
import { PrimaryButton } from "../../ui/PrimaryButton";
import { SecondaryButton } from "../../ui/SecondaryButton";
import { TextButton } from "../../ui/TextButton";
import { ToastNotification } from "../../ui/ToastNotification";

export function SettingsPanel({
  title,
  subtitle,
  onBack,
  onSave,
  saving,
  children,
}: {
  title: string;
  subtitle: string;
  onBack: () => void;
  onSave?: () => Promise<boolean>;
  saving?: boolean;
  children: React.ReactNode;
}) {
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);

  const handleSave = async () => {
    if (!onSave) return;
    const ok = await onSave();
    setToast(
      ok
        ? { ok: true, msg: "Changes saved successfully!" }
        : { ok: false, msg: "Failed to save changes. Please try again." }
    );
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toast */}
      {toast && (
        <ToastNotification
          variant={toast.ok ? "success" : "error"}
          title={toast.msg}
          dismissible
          onDismiss={() => setToast(null)}
        />
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white border border-warm-200 rounded-2xl shadow-sm p-7">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-neutral-800">{title}</h2>
              <p className="text-sm text-neutral-500 mt-0.5">{subtitle}</p>
            </div>
            <TextButton
              label="Back"
              onClick={onBack}
              size="xs"
              leftIcon={<ChevronLeft size={14} />}
            />
          </div>

          {/* Panel body */}
          {children}
        </div>
      </div>

      {/* Sticky footer */}
      {onSave && (
        <div className="pt-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-warm-300" />
            <span className="text-xs text-neutral-500">
              Happy with your changes?
            </span>
            <div className="flex-1 h-px bg-warm-300" />
          </div>
          <div className="flex gap-3 [&>*]:flex-1 [&>*>button]:w-full">
            <div>
              <SecondaryButton label="Cancel" onClick={onBack} />
            </div>
            <div>
              <PrimaryButton
                label={saving ? "Saving..." : "Save Changes"}
                onClick={handleSave}
                disabled={saving}
                rightIcon={saving ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Save size={15} aria-hidden="true" />}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
