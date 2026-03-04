import { useState } from "react";
import { EyeOff, Eye } from "lucide-react";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import type { AuthFormData } from "../../../hooks/useAuthModal";

interface Props {
  formData: AuthFormData;
  updateData: (patch: Partial<AuthFormData>) => void;
  onContinue: () => void;
  loading: boolean;
}

export function StepPassword({
  formData,
  updateData,
  onContinue,
  loading,
}: Props) {
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isValid =
    formData.password.length >= 8 &&
    formData.password === formData.confirmPassword;

  return (
    <div className="px-5 pt-5 pb-4 flex flex-col gap-5 flex-1">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Create a password</h2>
        <p className="text-sm text-gray-500 mt-1">
          Make it strong and memorable
        </p>
      </div>

      {/* No back button on this step — email is already verified */}
      <div className="flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-lg px-3.5 py-2.5">
        <span className="text-teal-500 text-sm">✓</span>
        <p className="text-sm text-teal-700">
          Email verified — <span className="font-medium">{formData.email}</span>
        </p>
      </div>

      <Input
        label="Password"
        type={showPw ? "text" : "password"}
        placeholder="At least 8 characters"
        value={formData.password}
        onChange={(e) => updateData({ password: e.target.value })}
        disabled={loading}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            tabIndex={-1}
          >
            {showPw ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        }
      />

      <Input
        label="Confirm password"
        type={showConfirm ? "text" : "password"}
        placeholder="Re-enter your password"
        value={formData.confirmPassword}
        onChange={(e) => updateData({ confirmPassword: e.target.value })}
        disabled={loading}
        error={
          formData.confirmPassword &&
          formData.password !== formData.confirmPassword
            ? "Passwords don't match"
            : undefined
        }
        rightIcon={
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            tabIndex={-1}
          >
            {showConfirm ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        }
      />

      {/* Only Continue — no Back button since email is already verified */}
      <div className="mt-auto">
        <Button
          variant="primary"
          fullWidth
          onClick={onContinue}
          disabled={!isValid || loading}
        >
          {loading ? "Setting up..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}
