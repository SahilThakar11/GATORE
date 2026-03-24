import { ChevronLeft } from "lucide-react";
import { Input } from "../../ui/Input";
import { PrimaryButton } from "../../ui/PrimaryButton";
import { SecondaryButton } from "../../ui/SecondaryButton";
import type { AuthFormData } from "../../../hooks/useAuthModal";

interface Props {
  formData: AuthFormData;
  updateData: (patch: Partial<AuthFormData>) => void;
  onContinue: () => void;
  onBack: () => void;
  loading: boolean;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function StepProfile({
  formData,
  updateData,
  onContinue,
  onBack,
  loading,
}: Props) {
  const isValid = formData.name.trim().length > 0;
  const phoneDigits = formData.phone.replace(/\D/g, "");
  const phoneError =
    formData.phone.length > 0 && phoneDigits.length !== 10
      ? "Please enter a valid 10-digit phone number"
      : undefined;
  const canContinue = isValid && !phoneError;

  return (
    <>
      <div className="px-5 pt-5 pb-4 flex flex-col gap-5 flex-1">
        <div>
          <h2 id="auth-step-heading" className="text-xl sm:text-2xl font-bold text-neutral-800">
            Tell us about yourself
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
            We'll use this to personalize your experience
          </p>
        </div>

        <Input
          label="Your name"
          type="text"
          placeholder="What should we call you?"
          value={formData.name}
          onChange={(e) => updateData({ name: e.target.value })}
          autoFocus
        />

        <Input
          label={
            <span>
              Phone number{" "}
              <span className="text-neutral-600 font-normal">(optional)</span>
            </span>
          }
          type="tel"
          placeholder="(416) 555-0100"
          value={formData.phone}
          onChange={(e) => updateData({ phone: formatPhone(e.target.value) })}
          error={phoneError}
        />
      </div>
      <div className="mt-auto flex gap-3 bg-warm-50 px-4 py-4 border border-warm-200">
        <div className="flex-1 [&>button]:w-full">
          <SecondaryButton label="Back" onClick={onBack} disabled={loading} leftIcon={<ChevronLeft size={16} aria-hidden="true" />} />
        </div>
        <div className="flex-1 [&>button]:w-full">
          <PrimaryButton label={loading ? "Saving..." : "Continue"} onClick={onContinue} disabled={!canContinue || loading} />
        </div>
      </div>
    </>
  );
}
