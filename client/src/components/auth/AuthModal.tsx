import { useEffect } from "react";
import { X } from "lucide-react";
import { StepProgress } from "./StepProgress";
import { ErrorBanner } from "../ui/ErrorBanner";
import { StepEmail } from "./steps/StepEmail";
import { StepOTPVerify } from "./steps/StepOTPVerify";
import { StepPassword } from "./steps/StepPassword";
import { StepProfile } from "./steps/StepProfile";
import { StepPreferences } from "./steps/StepPreferences";
import { StepSuccess } from "./steps/StepSuccess";
import { StepSignIn } from "./steps/StepSignIn";
import { useAuthModal } from "../../hooks/useAuthModal";
import gatoreLogo from "/logo.png";
import { AuthHeader } from "./Header";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  auth: ReturnType<typeof useAuthModal>;
}

export function AuthModal({ isOpen, onClose, auth }: AuthModalProps) {
  const {
    step,
    formData,
    updateData,
    mode,
    switchMode,
    loading,
    error,
    clearError,
    canGoBack,
    goBack,
    googleSignIn,
    stepNumber,
    totalSteps,
    submitEmail,
    submitOTP,
    resendOTP,
    submitPassword,
    submitProfile,
    submitSignIn,
    submitPreferences,
  } = auth;

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape — but only if not mid-verified flow
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!isOpen) return null;

  const showProgress = step !== "success" && step !== "signin";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-[480px] bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
        >
          <X size={14} />
        </button>

        <AuthHeader logoSrc={gatoreLogo} />

        {showProgress && (
          <StepProgress current={stepNumber} total={totalSteps} />
        )}

        {/* Error banner — sits above step content, below progress */}
        {error && <ErrorBanner message={error} onDismiss={clearError} />}

        {/* Step content */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          {step === "signin" && (
            <StepSignIn
              formData={formData}
              updateData={updateData}
              onSubmit={submitSignIn}
              onClose={onClose}
              onSwitchToSignup={switchMode}
              onGoogleSuccess={googleSignIn}
              loading={loading}
            />
          )}
          {step === "email" && (
            <StepEmail
              formData={formData}
              updateData={updateData}
              onContinue={submitEmail}
              onBack={onClose}
              onGoogleSuccess={googleSignIn}
              loading={loading}
              onSwitchToSignIn={switchMode}
            />
          )}
          {step === "otp" && (
            <StepOTPVerify
              formData={formData}
              updateData={updateData}
              onContinue={submitOTP}
              onBack={canGoBack ? goBack : onClose}
              onResend={resendOTP}
              loading={loading}
            />
          )}
          {step === "password" && (
            <StepPassword
              formData={formData}
              updateData={updateData}
              onContinue={submitPassword}
              loading={loading}
              // No onBack — intentionally omitted, email is verified
            />
          )}
          {step === "profile" && (
            <StepProfile
              formData={formData}
              updateData={updateData}
              onContinue={submitProfile}
              onBack={goBack}
            />
          )}
          {step === "preferences" && (
            <StepPreferences
              formData={formData}
              updateData={updateData}
              onContinue={submitPreferences}
              onBack={goBack}
            />
          )}
          {step === "success" && (
            <StepSuccess formData={formData} onClose={onClose} />
          )}
        </div>

        {/* Powered by footer */}
        <div className="py-3 text-center text-xs text-gray-400 border-t border-gray-100 shrink-0">
          Powered by{" "}
          <span className="font-bold text-teal-600 tracking-wide">GATORE</span>
        </div>
      </div>
    </div>
  );
}
