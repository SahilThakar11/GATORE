import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export type BPStep = "choose" | "signin" | "otp" | "request" | "success";

export interface RequestAccessForm {
  cafeName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  message: string;
}

const BASE_URL = "/api/business";

export function useBusinessPortal(defaultStep: BPStep = "choose") {
  const navigate = useNavigate();
  const { setAuth } = useAuth();

  const [step, setStep] = useState<BPStep>(defaultStep);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedCafe, setSubmittedCafe] = useState({ name: "", email: "" });

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const clearError = useCallback(() => setError(null), []);

  const reset = useCallback(() => {
    setStep(defaultStep);
    setEmail("");
    setError(null);
    setLoading(false);
    setSubmittedCafe({ name: "", email: "" });
  }, [defaultStep]);

  const goBack = useCallback(() => {
    setStep("choose");
    setError(null);
  }, []);

  const goToSignIn = useCallback(() => setStep("signin"), []);
  const goToRequest = useCallback(() => setStep("request"), []);

  // ─── Sign-in OTP flow ───────────────────────────────────────────────────────

  const sendOTP = useCallback(async (emailVal: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailVal }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.message || "Failed to send verification code.");
        return;
      }

      setEmail(emailVal);
      setStep("otp");
    } catch {
      setError("Failed to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyOTP = useCallback(
    async (otp: string) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BASE_URL}/verify-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        });

        const json = await res.json();

        if (!res.ok) {
          setError(json.message || "Verification failed. Please try again.");
          return;
        }

        // Persist auth and redirect
        setAuth(json.data.user, json.data.accessToken, json.data.refreshToken);
        navigate("/dashboard");
      } catch {
        setError("Verification failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [email, setAuth, navigate],
  );

  const resendOTP = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.message || "Failed to resend code.");
      }
    } catch {
      setError("Failed to resend code.");
    }
  }, [email]);

  const changeEmail = useCallback(() => {
    setStep("signin");
    setError(null);
  }, []);

  // ─── Request access flow ────────────────────────────────────────────────────

  const submitAccessRequest = useCallback(async (form: RequestAccessForm) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/request-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(
          json.message || "Failed to submit request. Please try again.",
        );
        return;
      }

      setSubmittedCafe({ name: form.cafeName, email: form.email });
      setStep("success");
    } catch {
      setError("Failed to submit request. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const resetRequest = useCallback(() => {
    setStep("request");
    setSubmittedCafe({ name: "", email: "" });
  }, []);

  // ─── Step meta (for StepProgress) ───────────────────────────────────────────

  const STEP_META: Partial<
    Record<BPStep, { current: number; total: number }>
  > = {
    signin: { current: 1, total: 2 },
    otp: { current: 2, total: 2 },
    request: { current: 1, total: 1 },
  };

  const stepMeta = STEP_META[step];
  const showProgress = !!stepMeta && step !== "success";

  return {
    // State
    step,
    email,
    loading,
    error,
    submittedCafe,
    stepMeta,
    showProgress,

    // Actions
    clearError,
    reset,
    goBack,
    goToSignIn,
    goToRequest,

    // Sign-in OTP
    sendOTP,
    verifyOTP,
    resendOTP,
    changeEmail,

    // Request access
    submitAccessRequest,
    resetRequest,
  };
}
