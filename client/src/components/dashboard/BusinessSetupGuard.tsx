import { useState, useEffect } from "react";
import { ArrowRight, Building2, Loader2, LogOut, CheckCircle2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useBusinessDashboard } from "../../hooks/useBusinessDashboard";
import type { SetupPrefill } from "../../hooks/useBusinessDashboard";
import CafeSetupWizard from "./CafeSetupWizard";

const SETUP_STEPS = [
  "Business profile & contact info",
  "Tables and seating configuration",
  "Operating hours",
  "Pricing model",
];

export default function BusinessSetupGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loading, needsSetup, profile, completeSetup, fetchPrefill } = useBusinessDashboard();
  const { logout } = useAuth();
  const [showWizard, setShowWizard] = useState(false);
  const [prefill, setPrefill] = useState<SetupPrefill | null>(null);

  // Load access-request prefill data once we know setup is needed
  useEffect(() => {
    if (!loading && needsSetup && !profile) {
      fetchPrefill().then(setPrefill);
    }
  }, [loading, needsSetup, profile, fetchPrefill]);

  /* ── Loading ─────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf8f4] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-teal-600" />
      </div>
    );
  }

  /* ── Setup Required ──────────────────────────────────────────────── */
  if (needsSetup) {
    return (
      <div className="min-h-screen bg-[#faf8f4] flex flex-col items-center justify-center px-4">
        {/* Logout link top-right */}
        <button
          onClick={logout}
          className="absolute top-6 right-8 flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <LogOut size={15} />
          Log out
        </button>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-lg w-full max-w-lg p-10 flex flex-col items-center text-center">
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: "linear-gradient(135deg, #0a5c47, #0d9488)" }}
          >
            <Building2 size={28} className="text-white" />
          </div>

          <h1 className="text-2xl font-black text-gray-900 mb-2">
            Welcome to Gatore!
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm">
            Before customers can find and book your café, you need to complete a
            quick one-time setup. It only takes a few minutes.
          </p>

          {/* Steps checklist */}
          <ul className="w-full text-left flex flex-col gap-2.5 mb-8">
            {SETUP_STEPS.map((step) => (
              <li key={step} className="flex items-center gap-3">
                <CheckCircle2 size={17} className="text-teal-400 shrink-0" />
                <span className="text-sm text-gray-700">{step}</span>
              </li>
            ))}
          </ul>

          <button
            onClick={() => setShowWizard(true)}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-8 py-3.5 rounded-xl transition-all shadow-sm hover:shadow-md w-full justify-center cursor-pointer"
          >
            Begin Setup
            <ArrowRight size={16} />
          </button>

          <p className="text-xs text-gray-400 mt-4">
            You can edit all settings later from your dashboard.
          </p>
        </div>

        {/* Setup Wizard */}
        <CafeSetupWizard
          isOpen={showWizard}
          onClose={() => setShowWizard(false)}
          onComplete={async (data) => {
            const result = await completeSetup(data);
            if (result.success) setShowWizard(false);
            return result;
          }}
          businessName={prefill?.cafeName ?? profile?.name ?? "Your Café"}
          initialProfile={
            prefill
              ? {
                  contactName: prefill.ownerName,
                  contactEmail: prefill.email,
                  phone: prefill.phone,
                  city: prefill.city,
                }
              : profile
          }
        />
      </div>
    );
  }

  /* ── Setup complete — render the page normally ───────────────────── */
  return <>{children}</>;
}
