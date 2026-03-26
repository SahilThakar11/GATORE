import { useEffect, useRef, useState } from "react";
import { Lock, Clock, ChevronLeft } from "lucide-react";
import { PrimaryButton } from "../ui/PrimaryButton";
import { SecondaryButton } from "../ui/SecondaryButton";
import { TextButton } from "../ui/TextButton";

interface Props {
  email: string;
  onVerify: (otp: string) => void;
  onResend: () => void;
  onChangeEmail: () => void;
  loading: boolean;
}

export function BPOTPVerify({
  email,
  onVerify,
  onResend,
  onChangeEmail,
  loading,
}: Props) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [resending, setResending] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const isComplete = digits.every((d) => d !== "");

  // Auto-focus first box
  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  // Auto-submit when all digits are filled
  useEffect(() => {
    if (isComplete && !loading) {
      onVerify(digits.join(""));
    }
  }, [digits]);

  const handleChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    if (val && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const next = [...digits];
    pasted.split("").forEach((d, i) => {
      next[i] = d;
    });
    setDigits(next);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleResend = async () => {
    setResending(true);
    setDigits(["", "", "", "", "", ""]);
    await onResend();
    setResending(false);
    refs.current[0]?.focus();
  };

  return (
    <div className="px-5 pt-5 pb-4 flex flex-col gap-5 flex-1">
      <div>
        <h2 id="auth-step-heading" className="text-xl sm:text-2xl font-bold text-neutral-800">Check your email</h2>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-neutral-800">{email}</span>
        </p>
      </div>

      {/* OTP boxes */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex justify-center gap-2.5 py-2">
          {digits.map((digit, idx) => (
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
              className="w-12 h-14 text-center text-lg font-semibold border border-warm-300 rounded-lg bg-warm-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all disabled:opacity-50"
            />
          ))}
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-600">
          <Clock size={14} className="text-teal-600" />
          Code expires in 10 minutes
        </div>
      </div>

      {/* Resend */}
      <div className="text-center">
        <p className="text-xs sm:text-sm text-neutral-600">
          Didn't receive it?{" "}
          <TextButton
            label={resending ? "Sending…" : "Resend code"}
            onClick={handleResend}
            disabled={loading || resending}
            isLoading={resending}
            size="small"
          />
        </p>
      </div>

      <div className="mt-auto flex gap-3 bg-warm-50 px-4 py-4 border border-warm-200 -mx-5 -mb-4">
        <div className="flex-1 [&>button]:w-full">
          <SecondaryButton label="Back" onClick={onChangeEmail} disabled={loading} leftIcon={<ChevronLeft size={16} aria-hidden="true" />} />
        </div>
        <div className="flex-1 [&>button]:w-full">
          <PrimaryButton
            label={loading ? "Verifying…" : "Continue"}
            onClick={() => onVerify(digits.join(""))}
            disabled={!isComplete || loading}
            isLoading={loading}
            rightIcon={!loading ? <Lock size={14} aria-hidden="true" /> : undefined}
          />
        </div>
      </div>
    </div>
  );
}
