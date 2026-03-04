import { useGoogleLogin } from "@react-oauth/google";
import { useState } from "react";

export interface GoogleUser {
  email: string;
  name: string;
  googleId: string;
  isNewUser: boolean;
  accessToken: string;
  refreshToken: string;
}

interface GoogleAuthButtonProps {
  onSuccess: (user: GoogleUser) => void;
  onError?: (error: Error) => void;
  label?: string;
  className?: string;
}

export function GoogleAuthButton({
  onSuccess,
  onError,
  label = "Continue with Google",
  className = "",
}: GoogleAuthButtonProps) {
  const [loading, setLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: tokenResponse.access_token }),
        });

        if (!res.ok) {
          const { message } = await res.json();
          throw new Error(message ?? "Google auth failed");
        }

        const { data } = await res.json();

        onSuccess({
          email: data.user.email,
          name: data.user.name,
          googleId: data.user.id,
          isNewUser: data.isNewUser,
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
      } catch (err) {
        onError?.(err as Error);
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      onError?.(new Error("Google login failed"));
    },
  });

  return (
    <button
      type="button"
      onClick={() => login()}
      disabled={loading}
      className={`w-full flex items-center justify-center gap-3 border border-warm-200 rounded-lg py-3 text-sm font-medium text-gray-700 bg-white hover:bg-warm-50 active:bg-warm-100 transition-colors focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${className}`}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-gray-300 border-t-teal-500 rounded-full animate-spin" />
      ) : (
        <GoogleIcon />
      )}
      {loading ? "Signing in..." : label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.705 17.64 9.2z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
      />
    </svg>
  );
}
