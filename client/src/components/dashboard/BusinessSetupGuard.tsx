import { useState, useEffect } from "react";
import { Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { GatoreLogo } from "../ui/GatoreLogo";
import { useAuth } from "../../context/AuthContext";
import { useBusinessDashboard } from "../../hooks/useBusinessDashboard";
import type { SetupPrefill } from "../../hooks/useBusinessDashboard";
import CafeSetupWizard from "./CafeSetupWizard";
import { PrimaryButton } from "../ui/PrimaryButton";
import { LogoutButton } from "../ui/LogoutButton";

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
  const { loading, needsSetup, profile, completeSetup, fetchPrefill } =
    useBusinessDashboard();
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
      <div className="min-h-screen bg-warm-100 flex flex-col items-center justify-center px-4">
        {/* Logout top-right */}
        <div className="absolute top-6 right-8">
          <LogoutButton onLogout={logout} />
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-warm-200 shadow-lg w-full max-w-lg p-10 flex flex-col items-center text-center">
          <GatoreLogo className="w-36 h-18 mb-4" animateDie />

          <h1 className="text-2xl font-bold text-neutral-800 mb-2">
            Welcome to Gatore!
          </h1>
          <p className="text-neutral-600 text-sm leading-relaxed mb-8 max-w-sm">
            Before customers can find and book your café, you need to complete a
            quick one-time setup. It only takes a few minutes.
          </p>

          {/* Steps checklist */}
          <ul className="w-full text-left flex flex-col gap-2.5 mb-8">
            {SETUP_STEPS.map((step) => (
              <li key={step} className="flex items-center gap-3">
                <CheckCircle2 size={17} className="text-teal-600 shrink-0" />
                <span className="text-sm text-neutral-700">{step}</span>
              </li>
            ))}
          </ul>

          <div className="w-full [&>button]:w-full">
            <PrimaryButton
              label="Begin Setup"
              onClick={() => setShowWizard(true)}
              rightIcon={<ArrowRight size={16} aria-hidden="true" />}
            />
          </div>

          <p className="text-xs text-neutral-500 mt-4">
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
