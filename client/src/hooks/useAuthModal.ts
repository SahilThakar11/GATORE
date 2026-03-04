import { useState, useCallback } from "react";
import { type GoogleUser } from "../components/auth/GoogleAuthButton";
import { useAuth } from "../context/AuthContext";

export type AuthStep =
  | "email"
  | "otp"
  | "password"
  | "profile"
  | "preferences"
  | "success"
  | "signin";

export type AuthMode = "signup" | "signin";

export interface AuthFormData {
  email: string;
  otp: string[];
  password: string;
  confirmPassword: string;
  name: string;
  phone: string;
  gameTypes: string[];
  groupSize: string;
  complexity: string;
  isGoogleAuth: boolean;
}

interface StepState {
  emailVerified: boolean;
  passwordSet: boolean;
}

const INITIAL_DATA: AuthFormData = {
  email: "",
  otp: ["", "", "", "", "", ""],
  password: "",
  confirmPassword: "",
  name: "",
  phone: "",
  gameTypes: [],
  groupSize: "any",
  complexity: "any",
  isGoogleAuth: false,
};

const BASE_URL = "/api/auth";

export function useAuthModal() {
  const { setAuth, logout: contextLogout } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>("signup");
  const [step, setStep] = useState<AuthStep>("email");
  const [formData, setFormData] = useState<AuthFormData>(INITIAL_DATA);
  const [stepState, setStepState] = useState<StepState>({
    emailVerified: false,
    passwordSet: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = (initialMode: AuthMode = "signup") => {
    setMode(initialMode);
    setStep(initialMode === "signin" ? "signin" : "email");
    setFormData(INITIAL_DATA);
    setStepState({ emailVerified: false, passwordSet: false });
    setError(null);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setError(null);
  };

  const updateData = (patch: Partial<AuthFormData>) => {
    setFormData((prev) => ({ ...prev, ...patch }));
    setError(null);
  };

  const clearError = () => setError(null);

  const switchMode = () => {
    setError(null);
    setFormData(INITIAL_DATA);
    if (mode === "signup") {
      setMode("signin");
      setStep("signin");
    } else {
      setMode("signup");
      setStep("email");
    }
  };

  // ─── Back logic ────────────────────────────────────────────────────────────
  const goBack = () => {
    setError(null);
    if (step === "otp" && !stepState.emailVerified) {
      setStep("email");
      return;
    }
    if (step === "preferences") {
      setStep("profile");
      return;
    }
    close();
  };

  const canGoBack =
    step === "email" ||
    step === "signin" ||
    (step === "otp" && !stepState.emailVerified) ||
    step === "preferences";

  // ─── Sign In ────────────────────────────────────────────────────────────────
  const submitSignIn = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.message);
        return;
      }

      // Store in context + localStorage
      setAuth(json.data.user, json.data.accessToken, json.data.refreshToken);
      close();
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [formData.email, formData.password]);

  // ─── Signup flow ────────────────────────────────────────────────────────────
  const submitEmail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.message);
        return;
      }

      if (json.message === "resume_password") {
        setStepState((prev) => ({ ...prev, emailVerified: true }));
        setStep("password");
        return;
      }

      setStep("otp");
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [formData.email]);

  const submitOTP = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp.join(""),
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.message);
        return;
      }

      localStorage.setItem("accessToken", json.data.accessToken);
      localStorage.setItem("refreshToken", json.data.refreshToken);

      setStepState((prev) => ({ ...prev, emailVerified: true }));
      setStep("password");
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [formData.email, formData.otp]);

  const resendOTP = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.message);
        return;
      }
      updateData({ otp: ["", "", "", "", "", ""] });
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [formData.email]);

  const submitPassword = useCallback(() => {
    setError(null);
    setStep("profile");
  }, []);

  const submitProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BASE_URL}/signup/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.message);
        return;
      }

      // Now store auth — user is fully set up
      const accessToken = localStorage.getItem("accessToken")!;
      const refreshToken = localStorage.getItem("refreshToken")!;
      setAuth(
        {
          id: json.data?.user?.id ?? "",
          ...json.data?.user,
          name: formData.name,
          email: formData.email,
          role: "user",
        },
        accessToken,
        refreshToken,
      );

      setStepState((prev) => ({ ...prev, passwordSet: true }));
      setStep("preferences");
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, [formData.email, formData.password, formData.name]);

  const submitPreferences = useCallback(() => {
    setError(null);
    setStep("success");
  }, []);

  // ─── Google ─────────────────────────────────────────────────────────────────
  const googleSignIn = useCallback((user: GoogleUser) => {
    setError(null);

    // Always store auth context regardless of new/returning
    setAuth(
      { id: user.googleId, email: user.email, name: user.name, role: "user" },
      user.accessToken,
      user.refreshToken,
    );

    if (user.isNewUser) {
      // New user — collect profile info
      setFormData((prev) => ({
        ...prev,
        email: user.email,
        name: user.name,
        isGoogleAuth: true,
      }));
      setStepState({ emailVerified: true, passwordSet: true });
      setStep("profile");
    } else {
      // Returning user — just close the modal
      close();
    }
  }, []);

  // Called from GoogleAuthButton after backend responds
  const handleGoogleAuthSuccess = useCallback(
    (user: GoogleUser, accessToken: string, refreshToken: string) => {
      setAuth(
        { id: "", email: user.email, name: user.name, role: "user" },
        accessToken,
        refreshToken,
      );
      googleSignIn(user);
    },
    [],
  );

  // ─── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      await fetch(`${BASE_URL}/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // Still log out locally even if request fails
    } finally {
      contextLogout();
    }
  }, [contextLogout]);

  // ─── Step meta ───────────────────────────────────────────────────────────────
  const stepNumber = {
    email: 1,
    otp: 2,
    password: 3,
    profile: formData.isGoogleAuth ? 2 : 4,
    preferences: formData.isGoogleAuth ? 3 : 5,
    success: formData.isGoogleAuth ? 3 : 5,
    signin: 1,
  }[step];

  const totalSteps = formData.isGoogleAuth ? 3 : 5;

  return {
    isOpen,
    open,
    close,
    mode,
    switchMode,
    step,
    formData,
    updateData,
    loading,
    error,
    clearError,
    stepState,
    canGoBack,
    goBack,
    googleSignIn,
    handleGoogleAuthSuccess,
    logout,
    stepNumber,
    totalSteps,
    submitSignIn,
    submitEmail,
    submitOTP,
    resendOTP,
    submitPassword,
    submitProfile,
    submitPreferences,
  };
}
