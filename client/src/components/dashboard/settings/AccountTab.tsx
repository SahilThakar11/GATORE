import { useState } from "react";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { Input } from "../../ui/Input";
import { SettingsPanel } from "./SettingsPanel";

export default function AccountTab({ onBack }: { onBack: () => void }) {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <SettingsPanel
      title="Account"
      subtitle="Update your password and security settings"
      onBack={onBack}
    >
      <div className="flex flex-col gap-5">
        <Input
          label="Current password"
          type={showCurrent ? "text" : "password"}
          placeholder="Enter your current password"
          rightIcon={
            <button
              onClick={() => setShowCurrent((v) => !v)}
              className="cursor-pointer text-gray-400 hover:text-gray-600"
            >
              {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />

        <div>
          <Input
            label="New password"
            type={showNew ? "text" : "password"}
            placeholder="Create a new password"
            rightIcon={
              <button
                onClick={() => setShowNew((v) => !v)}
                className="cursor-pointer text-gray-400 hover:text-gray-600"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
          />
          <p className="text-[11px] text-gray-400 mt-1.5">
            Create a strong password: At least 8 characters with uppercase,
            lowercase and a number
          </p>
        </div>

        <Input
          label="Confirm new password"
          type={showConfirm ? "text" : "password"}
          placeholder="Re-enter your new password"
          rightIcon={
            <button
              onClick={() => setShowConfirm((v) => !v)}
              className="cursor-pointer text-gray-400 hover:text-gray-600"
            >
              {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />
      </div>

      {/* Links */}
      <div className="flex items-center gap-6 mt-6">
        <button className="text-sm font-medium text-teal-600 hover:text-teal-800 transition-colors cursor-pointer">
          See Terms and Conditions
        </button>
        <button className="text-sm font-medium text-teal-600 hover:text-teal-800 transition-colors cursor-pointer">
          See Privacy and Terms
        </button>
      </div>

      {/* Danger Zone */}
      <div className="mt-8 border-l-4 border-red-400 bg-red-50 rounded-r-xl p-5">
        <h4 className="text-sm font-bold text-red-600">Danger Zone</h4>
        <p className="text-xs text-red-400 mt-0.5">
          Deleting your account is permanent and cannot be undone.
        </p>
        <button className="mt-3 flex items-center gap-2 bg-white border-2 border-red-300 text-red-500 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-red-50 hover:border-red-400 transition-colors cursor-pointer">
          <Trash2 size={15} />
          Delete Account
        </button>
      </div>
    </SettingsPanel>
  );
}
