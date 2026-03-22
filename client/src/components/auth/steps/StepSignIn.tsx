import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "../../../components/ui/Input";
import { Button } from "../../../components/ui/Button";
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
        <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
        <p className="text-sm text-gray-500 mt-1">
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
            className="text-gray-400 hover:text-gray-600"
          >
            {showPw ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        }
      />

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-sm text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      <GoogleAuthButton
        onSuccess={onGoogleSuccess}
        onError={(e) => console.error(e)}
        label="Continue with Google"
      />

      {/* Switch to signup */}
      <p className="text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <button
          onClick={onSwitchToSignup}
          className="text-teal-700 font-medium hover:underline"
        >
          Sign up
        </button>
      </p>

      <div className="mt-auto flex gap-3">
        <Button
          variant="outline"
          fullWidth
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          fullWidth
          onClick={onSubmit}
          disabled={!isValid || loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </div>
    </div>
  );
}
