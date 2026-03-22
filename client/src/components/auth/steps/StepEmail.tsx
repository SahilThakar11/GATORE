import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
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
        <h2 className="text-2xl font-bold text-gray-900">Let's get started</h2>
        <p className="text-sm text-gray-500 mt-1">
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
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-sm text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <GoogleAuthButton
        onSuccess={onGoogleSuccess}
        onError={(e) => console.error(e)}
      />

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <button
          onClick={onSwitchToSignIn}
          className="text-teal-700 font-medium hover:underline"
        >
          Sign in
        </button>
      </p>

      <div className="mt-auto flex gap-3">
        <Button variant="outline" fullWidth onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button
          variant="primary"
          fullWidth
          onClick={onContinue}
          disabled={!isValid || loading}
        >
          {loading ? "Sending..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}
