import { useEffect, useRef } from "react";
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
import { StepEditProfile } from "./steps/StepEditProfile";
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
    goToEdit,
    submitEdit,
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

  // Focus trap
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!isOpen) return;
    const modal = modalRef.current;
    if (!modal) return;
    const focusable = modal.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const trap = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    modal.addEventListener("keydown", trap);
    return () => modal.removeEventListener("keydown", trap);
  }, [isOpen]);

  if (!isOpen) return null;

  const showProgress = step !== "success" && step !== "signin" && step !== "edit";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-step-heading"
        className="relative w-full max-w-[700px] bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white border border-teal-700 text-teal-700 hover:bg-teal-50 transition-colors focus-visible:outline-2 focus-visible:outline-teal-700 cursor-pointer"
        >
          <X size={14} aria-hidden="true" />
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
              loading={loading}
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
            <StepSuccess formData={formData} onClose={onClose} onEdit={goToEdit} />
          )}
          {step === "edit" && (
            <StepEditProfile
              formData={formData}
              updateData={updateData}
              onSave={submitEdit}
              onBack={goBack}
              loading={loading}
            />
          )}
        </div>

        {/* Powered by footer */}
        <div className="py-3 text-center text-xs text-gray-400 border-t border-gray-100 shrink-0">
          Powered by{" "}
          <span className="font-bold text-teal-700 tracking-wide">GATORE</span>
        </div>
      </div>
    </div>
  );
}
