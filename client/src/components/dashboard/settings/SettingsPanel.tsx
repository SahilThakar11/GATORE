import { useState } from "react";
import { ArrowLeft, Save, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "../../ui/Button";

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
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl border text-sm font-medium transition-all animate-in slide-in-from-bottom-2 ${
            toast.ok
              ? "bg-white border-teal-200 text-teal-800"
              : "bg-white border-red-200 text-red-700"
          }`}
        >
          {toast.ok ? (
            <CheckCircle2 size={18} className="text-teal-500 shrink-0" />
          ) : (
            <XCircle size={18} className="text-red-500 shrink-0" />
          )}
          {toast.msg}
        </div>
      )}

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-7">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
            </div>
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-800 transition-colors cursor-pointer"
            >
              <ArrowLeft size={15} />
              Back
            </button>
          </div>

          {/* Panel body */}
          {children}
        </div>
      </div>

      {/* Sticky footer */}
      <div className="pt-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">
            Happy with your changes?
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onBack}>
            Cancel
          </Button>
          <Button variant="primary" fullWidth onClick={handleSave} disabled={saving}>
            <span className="flex items-center justify-center gap-2">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {saving ? "Saving..." : "Save Changes"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
