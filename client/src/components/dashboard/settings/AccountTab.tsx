import { useState } from "react";
import { Trash2, AlertTriangle, Loader2, ChevronLeft } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useBusinessDashboard } from "../../../hooks/useBusinessDashboard";
import { useBusinessSettings } from "../../../hooks/useBusinessSettings";
import { TextButton } from "../../ui/TextButton";

export default function AccountTab({ onBack }: { onBack: () => void }) {
  const { logout } = useAuth();
  const { profile } = useBusinessDashboard();
  const { deleteAccount, saving } = useBusinessSettings();

  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const canDelete = confirmText === "DELETE";

  const handleDelete = async () => {
    if (!canDelete) return;
    setError(null);
    const result = await deleteAccount();
    if (result?.success) {
      logout();
    } else {
      setError(result?.message || "Failed to delete account. Please try again.");
    }
  };

  return (
    <div className="bg-white border border-warm-200 rounded-2xl shadow-sm p-7 max-w-xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-neutral-800">Account</h2>
          <p className="text-sm text-neutral-500 mt-0.5">Manage your business account</p>
        </div>
        <TextButton
          label="Back"
          onClick={onBack}
          size="xs"
          leftIcon={<ChevronLeft size={14} />}
        />
      </div>

      {/* Danger Zone */}
      <div className="border-2 border-red-200 rounded-2xl overflow-hidden">
        {/* Red header band */}
        <div className="bg-red-50 px-6 py-4 flex items-center gap-3 border-b border-red-200">
          <AlertTriangle size={18} className="text-red-500 shrink-0" aria-hidden="true" />
          <h3 className="text-sm font-bold text-red-700">Danger Zone</h3>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          {/* What gets deleted */}
          <div>
            <p className="text-sm font-bold text-neutral-800 mb-3">
              Delete Business Account
            </p>
            <p className="text-sm text-neutral-500 leading-relaxed">
              This will permanently delete{" "}
              <span className="font-semibold text-neutral-700">
                {profile?.name || "your café"}
              </span>{" "}
              and all associated data including tables, operating hours, menu items,
              game library, and all reservations. This action{" "}
              <span className="font-bold text-red-600">cannot be undone</span>.
            </p>

            <ul className="mt-3 flex flex-col gap-1">
              {[
                "Café profile & settings",
                "All tables and reservations",
                "Operating hours, menu & game library",
                "Your business access & permissions",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-neutral-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Type-to-confirm */}
          <div>
            <label htmlFor="delete-confirm" className="block text-sm font-medium text-neutral-800 mb-1.5">
              Type{" "}
              <code className="bg-warm-100 px-1.5 py-0.5 rounded text-red-600 font-mono">
                DELETE
              </code>{" "}
              to confirm
            </label>
            <input
              id="delete-confirm"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE here"
              className="w-full px-4 py-3 text-sm border border-warm-300 rounded-lg bg-warm-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 placeholder:text-neutral-500"
            />
          </div>

          {/* Error */}
          {error && (
            <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Delete button */}
          <button
            onClick={handleDelete}
            disabled={!canDelete || saving}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-lg text-sm font-semibold transition-all border cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2
              border-red-400 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600"
          >
            {saving ? (
              <Loader2 size={15} className="animate-spin" aria-hidden="true" />
            ) : (
              <Trash2 size={15} aria-hidden="true" />
            )}
            {saving ? "Deleting..." : "Delete My Business Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
