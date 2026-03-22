import { useEffect } from "react";
import { X } from "lucide-react";
import { BPChoose } from "./BPChoose";
import { BPSignIn } from "./BPSignIn";
import { BPOTPVerify } from "./BPOTPVerify";
import { BPRequestAccess } from "./BPRequestAccess";
import { BPRequestSuccess } from "./BPRequestSuccess";
import { AuthHeader } from "../auth/Header";
import { StepProgress } from "../auth/StepProgress";
import { ErrorBanner } from "../ui/ErrorBanner";
import { useBusinessPortal } from "../../hooks/useBusinessPortal";
import gatoreLogo from "/logo.png";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultStep?: "signin" | "request" | "choose";
}

export function BusinessPortalModal({
  isOpen,
  onClose,
  defaultStep = "choose",
}: Props) {
  const bp = useBusinessPortal(defaultStep);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && bp.step !== "success") handleClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, bp.step]);

  const handleClose = () => {
    onClose();
    setTimeout(bp.reset, 200);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && bp.step !== "success")
          handleClose();
      }}
    >
      <div className="relative w-full max-w-[700px] bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* ── Close button ─────────────────────────────────────────── */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors"
        >
          <X size={14} />
        </button>

        {/* ── Header ───────────────────────────────────────────────── */}
        <AuthHeader logoSrc={gatoreLogo} />

        {/* ── Step progress ────────────────────────────────────────── */}
        {bp.showProgress && (
          <StepProgress
            current={bp.stepMeta!.current}
            total={bp.stepMeta!.total}
          />
        )}

        {/* ── Error banner ─────────────────────────────────────────── */}
        {bp.error && (
          <ErrorBanner message={bp.error} onDismiss={bp.clearError} />
        )}

        {/* ── Step content ─────────────────────────────────────────── */}
        <div className="flex flex-col flex-1 overflow-y-auto">
          {bp.step === "choose" && (
            <BPChoose
              onSignIn={bp.goToSignIn}
              onRequest={bp.goToRequest}
            />
          )}
          {bp.step === "signin" && (
            <BPSignIn
              onSendOTP={bp.sendOTP}
              onBack={bp.goBack}
              loading={bp.loading}
            />
          )}
          {bp.step === "otp" && (
            <BPOTPVerify
              email={bp.email}
              onVerify={bp.verifyOTP}
              onResend={bp.resendOTP}
              onChangeEmail={bp.changeEmail}
              loading={bp.loading}
            />
          )}
          {bp.step === "request" && (
            <BPRequestAccess
              onSubmit={bp.submitAccessRequest}
              onBack={bp.goBack}
              loading={bp.loading}
            />
          )}
          {bp.step === "success" && (
            <BPRequestSuccess
              cafeName={bp.submittedCafe.name}
              email={bp.submittedCafe.email}
              onReset={bp.resetRequest}
              onClose={handleClose}
            />
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <div className="py-3 text-center text-xs text-gray-400 border-t border-gray-100 shrink-0">
          Powered by{" "}
          <span className="font-bold text-teal-700 tracking-wide">GATORE</span>
        </div>
      </div>
    </div>
  );
}
