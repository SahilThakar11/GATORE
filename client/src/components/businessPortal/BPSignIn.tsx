import { Mail, ArrowRight, Shield, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/Input";
import { PrimaryButton } from "../ui/PrimaryButton";
import { SecondaryButton } from "../ui/SecondaryButton";

interface Props {
  onSendOTP: (email: string) => void;
  onBack: () => void;
  loading: boolean;
}

export function BPSignIn({ onSendOTP, onBack, loading }: Props) {
  const [email, setEmail] = useState("");

  const isValid = email.trim().length > 0;

  return (
    <div className="px-5 pt-5 pb-4 flex flex-col gap-5 flex-1">
      <div>
        <h2 id="auth-step-heading" className="text-xl sm:text-2xl font-bold text-neutral-800">Sign in</h2>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
          Enter your business email and we'll send a secure one-time code.
        </p>
      </div>

      <Input
        label="Business email"
        type="email"
        placeholder="you@yourcafe.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leftIcon={<Mail size={16} aria-hidden="true" />}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter" && isValid) onSendOTP(email.trim());
        }}
      />

      <div className="flex items-center justify-center gap-2 text-xs text-neutral-600">
        <Shield size={14} aria-hidden="true" className="text-teal-600 shrink-0" />
        One-time code · expires in 10 minutes · no password stored
      </div>

      <div className="mt-auto flex gap-3 bg-warm-50 px-4 py-4 border border-warm-200 -mx-5 -mb-4">
        <div className="flex-1 [&>button]:w-full">
          <SecondaryButton label="Back" onClick={onBack} disabled={loading} leftIcon={<ChevronLeft size={16} aria-hidden="true" />} />
        </div>
        <div className="flex-1 [&>button]:w-full">
          <PrimaryButton
            label={loading ? "Sending…" : "Send code"}
            onClick={() => onSendOTP(email.trim())}
            disabled={!isValid || loading}
            isLoading={loading}
            rightIcon={!loading ? <ArrowRight size={16} aria-hidden="true" /> : undefined}
          />
        </div>
      </div>
    </div>
  );
}
