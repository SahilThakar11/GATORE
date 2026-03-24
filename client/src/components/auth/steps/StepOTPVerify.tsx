import { useEffect, useRef } from "react";
import { ChevronLeft } from "lucide-react";
import { PrimaryButton } from "../../ui/PrimaryButton";
import { SecondaryButton } from "../../ui/SecondaryButton";
import type { AuthFormData } from "../../../hooks/useAuthModal";

interface Props {
  formData: AuthFormData;
  updateData: (patch: Partial<AuthFormData>) => void;
  onContinue: () => void;
  onBack: () => void;
  onResend: () => void;
  loading: boolean;
}

export function StepOTPVerify({
  formData,
  updateData,
  onContinue,
  onBack,
  onResend,
  loading,
}: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const isComplete = formData.otp.every((d) => d !== "");

  // Auto focus first input on mount
  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  const handleChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...formData.otp];
    next[idx] = val;
    updateData({ otp: next });
    if (val && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !formData.otp[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!digits) return;
    const next = [...formData.otp];
    digits.split("").forEach((d, i) => {
      next[i] = d;
    });
    updateData({ otp: next });
    refs.current[Math.min(digits.length, 5)]?.focus();
  };

  return (
    <div className="px-5 pt-5 pb-4 flex flex-col gap-5 flex-1">
      <div>
        <h2 id="auth-step-heading" className="text-xl sm:text-2xl font-bold text-neutral-800">Check your email</h2>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-neutral-800">{formData.email}</span>
        </p>
      </div>

      {/* OTP inputs */}
      <div className="flex justify-center gap-2.5 py-2">
        {formData.otp.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              refs.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            aria-label={`Digit ${idx + 1} of 6`}
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            disabled={loading}
            className="w-11 h-12 text-center text-lg font-semibold border border-warm-300 rounded-lg bg-warm-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all disabled:opacity-50"
          />
        ))}
      </div>

      <div className="text-center space-y-2">
        <p className="text-xs sm:text-sm text-neutral-600">
          Didn't receive it?{" "}
          <button
            onClick={onResend}
            disabled={loading}
            className="text-teal-700 font-medium hover:underline disabled:opacity-50"
          >
            {loading ? "Sending..." : "Resend code"}
          </button>
        </p>
        {/* Can only use different email if not yet verified */}
        <button
          onClick={onBack}
          disabled={loading}
          className="text-xs sm:text-sm text-neutral-600 hover:text-neutral-800 flex items-center gap-1 mx-auto disabled:opacity-50"
        >
          <span aria-hidden="true">←</span> Use a different email
        </button>
      </div>

      <div className="mt-auto flex gap-3 bg-warm-50 px-4 py-4 border border-warm-200 -mx-5 -mb-4">
        <div className="flex-1 [&>button]:w-full">
          <SecondaryButton label="Back" onClick={onBack} disabled={loading} leftIcon={<ChevronLeft size={16} aria-hidden="true" />} />
        </div>
        <div className="flex-1 [&>button]:w-full">
          <PrimaryButton label="Continue" onClick={onContinue} disabled={!isComplete || loading} isLoading={loading} />
        </div>
      </div>
    </div>
  );
}
