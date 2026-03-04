import { useEffect, useRef } from "react";
import { Button } from "../../ui/Button";
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
        <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
        <p className="text-sm text-gray-500 mt-1">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-gray-700">{formData.email}</span>
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
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            disabled={loading}
            className="w-11 h-12 text-center text-lg font-semibold border border-gray-200 rounded-lg bg-[#faf8f4] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all disabled:opacity-50"
          />
        ))}
      </div>

      <div className="text-center space-y-2">
        <p className="text-sm text-gray-500">
          Didn't receive it?{" "}
          <button
            onClick={onResend}
            disabled={loading}
            className="text-teal-600 font-medium hover:underline disabled:opacity-50"
          >
            {loading ? "Sending..." : "Resend code"}
          </button>
        </p>
        {/* Can only use different email if not yet verified */}
        <button
          onClick={onBack}
          disabled={loading}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mx-auto disabled:opacity-50"
        >
          ← Use a different email
        </button>
      </div>

      <div className="mt-auto flex gap-3">
        <Button variant="outline" fullWidth onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button
          variant="primary"
          fullWidth
          onClick={onContinue}
          disabled={!isComplete || loading}
        >
          {loading ? "Verifying..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}
