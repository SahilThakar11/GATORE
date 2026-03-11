import { useEffect, useRef, useState } from "react";
import { Lock, Clock } from "lucide-react";
import { Button } from "../ui/Button";

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
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  const isComplete = digits.every((d) => d !== "");

  // Auto-focus first box
  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

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

  return (
    <div className="px-5 pt-5 pb-4 flex flex-col gap-5 flex-1">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Check your email</h2>
        <p className="text-sm text-gray-500 mt-1">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-gray-700">{email}</span>
        </p>
      </div>

      {/* OTP boxes */}
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
            onChange={(e) => handleChange(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            disabled={loading}
            className="w-11 h-12 text-center text-lg font-semibold border border-gray-200 rounded-lg bg-[#faf8f4] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all disabled:opacity-50"
          />
        ))}
      </div>

      {/* Resend / change email */}
      <div className="text-center space-y-2">
        <p className="text-sm text-gray-500">
          Didn't receive it?{" "}
          <button
            onClick={() => {
              setDigits(["", "", "", "", "", ""]);
              onResend();
            }}
            disabled={loading}
            className="text-teal-600 font-medium hover:underline disabled:opacity-50"
          >
            {loading ? "Sending..." : "Resend code"}
          </button>
        </p>
        <button
          onClick={onChangeEmail}
          disabled={loading}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mx-auto disabled:opacity-50"
        >
          ← Use a different email
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
        <Clock size={11} className="text-amber-400" />
        Code expires in 10 minutes
      </div>

      <div className="mt-auto flex gap-3">
        <Button
          variant="outline"
          fullWidth
          onClick={onChangeEmail}
          disabled={loading}
        >
          Back
        </Button>
        <Button
          variant="primary"
          fullWidth
          disabled={!isComplete || loading}
          onClick={() => onVerify(digits.join(""))}
        >
          <span className="flex items-center justify-center gap-2">
            <Lock size={14} />
            {loading ? "Verifying…" : "Continue"}
          </span>
        </Button>
      </div>
    </div>
  );
}
