import { ChevronLeft } from "lucide-react";
import { Input } from "../../ui/Input";
import { PrimaryButton } from "../../ui/PrimaryButton";
import { SecondaryButton } from "../../ui/SecondaryButton";
import { TextButton } from "../../ui/TextButton";
import type { AuthFormData } from "../../../hooks/useAuthModal";
import { GoogleAuthButton, type GoogleUser } from "../GoogleAuthButton";

interface Props {
  formData: AuthFormData;
  updateData: (patch: Partial<AuthFormData>) => void;
  onContinue: () => void;
  onBack: () => void;
  onGoogleSuccess: (user: GoogleUser) => void;
  loading: boolean;
  onSwitchToSignIn: () => void;
}

export function StepEmail({
  formData,
  updateData,
  onContinue,
  onBack,
  onGoogleSuccess,
  loading,
  onSwitchToSignIn,
}: Props) {
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  return (
    <div className="px-5 pt-5 pb-4 flex flex-col gap-5 flex-1">
      <div>
        <h2 id="auth-step-heading" className="text-xl sm:text-2xl font-bold text-neutral-800">Let's get started</h2>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
          Enter your email to create an account
        </p>
      </div>

      <Input
        label="Email address"
        type="email"
        placeholder="you@example.com"
        value={formData.email}
        onChange={(e) => updateData({ email: e.target.value })}
        onKeyDown={(e) => e.key === "Enter" && isValid && onContinue()}
        autoFocus
        disabled={loading}
      />

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-warm-300" />
        <span className="text-sm text-gray-600">or</span>
        <div className="flex-1 h-px bg-warm-300" />
      </div>

      <GoogleAuthButton
        onSuccess={onGoogleSuccess}
        onError={(e) => console.error(e)}
      />

      <p className="text-center text-xs sm:text-sm text-neutral-600">
        Already have an account?{" "}
        <TextButton label="Sign in" onClick={onSwitchToSignIn} size="small" />
      </p>

      <div className="mt-auto flex gap-3 bg-warm-50 px-4 py-4 border border-warm-200 -mx-5 -mb-4">
        <div className="flex-1 [&>button]:w-full">
          <SecondaryButton label="Back" onClick={onBack} disabled={loading} leftIcon={<ChevronLeft size={16} aria-hidden="true" />} />
        </div>
        <div className="flex-1 [&>button]:w-full">
          <PrimaryButton label="Continue" onClick={onContinue} disabled={!isValid || loading} isLoading={loading} />
        </div>
      </div>
    </div>
  );
}
