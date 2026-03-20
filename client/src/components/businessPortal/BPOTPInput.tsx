import React from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function BPOTPInput({ value, onChange }: Props) {
  const digits = value.padEnd(6, " ").split("").slice(0, 6);

  const handleChange = (i: number, v: string) => {
    const char = v.replace(/\D/g, "").slice(-1);
    const next = digits
      .map((d, idx) => (idx === i ? char : d))
      .join("")
      .replace(/ /g, "");
    onChange(next);
    if (char) {
      const inputs = document.querySelectorAll<HTMLInputElement>(".bp-otp-box");
      inputs[i + 1]?.focus();
    }
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    const inputs = document.querySelectorAll<HTMLInputElement>(".bp-otp-box");
    if (e.key === "Backspace" && !digits[i].trim() && i > 0) {
      inputs[i - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    onChange(pasted);
    e.preventDefault();
    // Focus last filled box
    const inputs = document.querySelectorAll<HTMLInputElement>(".bp-otp-box");
    inputs[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <input
          key={i}
          className="bp-otp-box w-11 h-12 text-center text-xl font-bold border border-warm-200 rounded-xl bg-[#faf8f4] text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all"
          maxLength={1}
          value={digits[i].trim()}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          inputMode="numeric"
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
}
