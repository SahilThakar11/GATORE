import { Mail, ArrowRight, Shield } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

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
        <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
        <p className="text-sm text-gray-500 mt-1">
          Enter your business email and we'll send a secure one-time code.
        </p>
      </div>

      <Input
        label="Business email"
        type="email"
        placeholder="you@yourcafe.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        leftIcon={<Mail size={16} />}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter" && isValid) onSendOTP(email.trim());
        }}
      />

      <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400">
        <Shield size={12} className="text-teal-500" />
        One-time code · expires in 10 minutes · no password stored
      </div>

      <div className="mt-auto flex gap-3">
        <Button variant="outline" fullWidth onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button
          variant="primary"
          fullWidth
          disabled={!isValid || loading}
          onClick={() => onSendOTP(email.trim())}
        >
          <span className="flex items-center justify-center gap-2">
            {loading ? (
              "Sending…"
            ) : (
              <>
                Send code <ArrowRight size={15} />
              </>
            )}
          </span>
        </Button>
      </div>
    </div>
  );
}
