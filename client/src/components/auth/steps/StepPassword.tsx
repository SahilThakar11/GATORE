import { useState } from "react";
import { EyeOff, Eye } from "lucide-react";
import { Input } from "../../ui/Input";
import { PrimaryButton } from "../../ui/PrimaryButton";
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

  const pw = formData.password;
  const rules = [
    { label: "At least 8 characters", pass: pw.length >= 8 },
    { label: "One uppercase letter", pass: /[A-Z]/.test(pw) },
    { label: "One lowercase letter", pass: /[a-z]/.test(pw) },
    { label: "One number", pass: /\d/.test(pw) },
    { label: "One special character", pass: /[!@#$%^&*(),.?":{}|<>]/.test(pw) },
  ];
  const allPassed = rules.every((r) => r.pass);
  const passedCount = rules.filter((r) => r.pass).length;
  const strengthPct = (passedCount / rules.length) * 100;
  const strengthColor =
    passedCount <= 1
      ? "bg-red-500"
      : passedCount <= 3
        ? "bg-amber-600"
        : "bg-teal-600";

  const isValid =
    allPassed && formData.password === formData.confirmPassword;

  return (
    <div className="px-5 pt-5 pb-4 flex flex-col gap-5 flex-1">
      <div>
        <h2 id="auth-step-heading" className="text-xl sm:text-2xl font-bold text-neutral-800">Create a password</h2>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
          Make it strong and memorable
        </p>
      </div>

      {/* No back button on this step — email is already verified */}
      <div className="flex items-center gap-2 bg-teal-50 border border-teal-100 rounded-lg px-3.5 py-2.5">
        <span className="text-teal-500 text-sm" aria-hidden="true">✓</span>
        <p className="text-xs sm:text-sm text-teal-700">
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
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? <Eye size={18} aria-hidden="true" /> : <EyeOff size={18} aria-hidden="true" />}
          </button>
        }
      />

      {/* Password strength bar + rules */}
      {pw.length > 0 && (
        <div className="-mt-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${strengthColor}`}
                style={{ width: `${strengthPct}%` }}
              />
            </div>
            <span className={`text-xs font-medium ${passedCount <= 1 ? "text-red-600" : passedCount <= 3 ? "text-amber-700" : "text-teal-700"}`}>
              {passedCount <= 1 ? "Weak" : passedCount <= 3 ? "Fair" : "Strong"}
            </span>
          </div>
        </div>
      )}
      {pw.length > 0 && (
        <div aria-live="polite" className="grid grid-cols-2 gap-x-4 gap-y-1 -mt-3">
          {rules.map((r) => (
            <p
              key={r.label}
              aria-label={`${r.label}: ${r.pass ? "requirement met" : "requirement not met"}`}
              className={`text-xs flex items-center gap-1 ${r.pass ? "text-teal-700" : "text-gray-600"}`}
            >
              <span aria-hidden="true">{r.pass ? "✓" : "○"}</span> {r.label}
            </p>
          ))}
        </div>
      )}

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
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? <Eye size={18} aria-hidden="true" /> : <EyeOff size={18} aria-hidden="true" />}
          </button>
        }
      />

      {/* Only Continue — no Back button since email is already verified */}
      <div className="mt-auto bg-warm-50 px-4 py-4 border border-warm-200 -mx-5 -mb-4 [&>button]:w-full">
        <PrimaryButton label={loading ? "Setting up..." : "Continue"} onClick={onContinue} disabled={!isValid || loading} />
      </div>
    </div>
  );
}

