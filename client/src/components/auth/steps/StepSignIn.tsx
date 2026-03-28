import { useState } from "react";
import { Eye, EyeOff, ChevronLeft } from "lucide-react";
import { Input } from "../../../components/ui/Input";
import { PrimaryButton } from "../../../components/ui/PrimaryButton";
import { SecondaryButton } from "../../../components/ui/SecondaryButton";
import { TextButton } from "../../../components/ui/TextButton";
import { GoogleAuthButton, type GoogleUser } from "../GoogleAuthButton";
import { type AuthFormData } from "../../../hooks/useAuthModal";

interface Props {
  formData: AuthFormData;
  updateData: (patch: Partial<AuthFormData>) => void;
  onSubmit: () => void;
  onClose: () => void;
  onSwitchToSignup: () => void;
  onGoogleSuccess: (user: GoogleUser) => void;
  loading: boolean;
}

export function StepSignIn({
  formData,
  updateData,
  onSubmit,
  onClose,
  onSwitchToSignup,
  onGoogleSuccess,
  loading,
}: Props) {
  const [showPw, setShowPw] = useState(false);

  const isValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) &&
    formData.password.length >= 1;

  return (
    <div className="px-5 pt-5 pb-4 flex flex-col gap-5 flex-1">
      <div>
        <h2 id="auth-step-heading" className="text-xl sm:text-2xl font-bold text-neutral-800">Welcome back</h2>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
          Sign in to your GATORE account
        </p>
      </div>

      <Input
        label="Email address"
        type="email"
        placeholder="you@example.com"
        value={formData.email}
        onChange={(e) => updateData({ email: e.target.value })}
        disabled={loading}
        autoFocus
      />

      <Input
        label="Password"
        type={showPw ? "text" : "password"}
        placeholder="Your password"
        value={formData.password}
        onChange={(e) => updateData({ password: e.target.value })}
        disabled={loading}
        onKeyDown={(e) => e.key === "Enter" && isValid && onSubmit()}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            tabIndex={-1}
            aria-label={showPw ? "Hide password" : "Show password"}
            className="text-gray-400 hover:text-gray-600"
          >
            {showPw ? <Eye size={18} aria-hidden="true" /> : <EyeOff size={18} aria-hidden="true" />}
          </button>
        }
      />

      {/* Divider */}
      <div className="flex items-center gap-3" aria-hidden="true">
        <div className="flex-1 h-px bg-warm-300" />
        <span className="text-sm text-gray-600">or</span>
        <div className="flex-1 h-px bg-warm-300" />
      </div>

      <GoogleAuthButton
        onSuccess={onGoogleSuccess}
        onError={(e) => console.error(e)}
        label="Continue with Google"
      />

      {/* Switch to signup */}
      <p className="text-center text-xs sm:text-sm text-neutral-600">
        Don't have an account?{" "}
        <TextButton label="Sign up" onClick={onSwitchToSignup} size="small" />
      </p>

      <div className="mt-auto flex gap-3 bg-warm-50 px-4 py-4 border border-warm-200 -mx-5 -mb-4">
        <div className="flex-1 [&>button]:w-full">
          <SecondaryButton label="Cancel" onClick={onClose} disabled={loading} leftIcon={<ChevronLeft size={16} aria-hidden="true" />} />
        </div>
        <div className="flex-1 [&>button]:w-full">
          <PrimaryButton label={loading ? "Signing in..." : "Sign in"} onClick={onSubmit} disabled={!isValid || loading} />
        </div>
      </div>
    </div>
  );
}
