import { ChevronLeft } from "lucide-react";
import { Input } from "../../ui/Input";
import { PrimaryButton } from "../../ui/PrimaryButton";
import { SecondaryButton } from "../../ui/SecondaryButton";
import type { AuthFormData } from "../../../hooks/useAuthModal";
import { GAME_TYPES, GROUP_SIZES, COMPLEXITIES } from "../../../utils/const";

interface Props {
  formData: AuthFormData;
  updateData: (patch: Partial<AuthFormData>) => void;
  onSave: () => void;
  onBack: () => void;
  loading: boolean;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function StepEditProfile({
  formData,
  updateData,
  onSave,
  onBack,
  loading,
}: Props) {
  const isValid = formData.name.trim().length > 0;
  const phoneDigits = formData.phone.replace(/\D/g, "");
  const phoneError =
    formData.phone.length > 0 && phoneDigits.length !== 10
      ? "Please enter a valid 10-digit phone number"
      : undefined;
  const canSave = isValid && !phoneError;

  const toggleGame = (id: string) => {
    const next = formData.gameTypes.includes(id)
      ? formData.gameTypes.filter((g) => g !== id)
      : [...formData.gameTypes, id];
    updateData({ gameTypes: next });
  };

  return (
    <>
      <div className="px-5 pt-5 pb-4 flex flex-col gap-5 flex-1 overflow-y-auto">
        {/* Header */}
        <div>
          <h2 id="auth-step-heading" className="text-xl sm:text-2xl font-bold text-neutral-800">
            Edit profile
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
            Update your details and preferences
          </p>
        </div>

        {/* Contact info section */}
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold text-neutral-600 tracking-wider uppercase">
            Contact Info
          </p>
          <Input
            label="Your name"
            type="text"
            placeholder="What should we call you?"
            value={formData.name}
            onChange={(e) => updateData({ name: e.target.value })}
            autoFocus
            disabled={loading}
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
            disabled={loading}
          />
        </div>

        {/* Game types section */}
        <div>
          <p className="text-xs font-semibold text-neutral-600 tracking-wider uppercase mb-3">
            Game Preferences
          </p>
          <p className="text-xs sm:text-sm font-medium text-neutral-800 mb-2">
            What types of games do you enjoy?
          </p>
          <div className="grid grid-cols-3 gap-2">
            {GAME_TYPES.map((g) => {
              const selected = formData.gameTypes.includes(g.id);
              return (
                <button
                  key={g.id}
                  onClick={() => toggleGame(g.id)}
                  aria-pressed={selected}
                  disabled={loading}
                  className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border text-sm font-normal transition-all cursor-pointer disabled:opacity-50 ${
                    selected
                      ? `${g.color} text-neutral-600 hover:opacity-80`
                      : "border-warm-200 bg-white text-neutral-600"
                  }`}
                >
                  <img src={g.icon} alt="" aria-hidden="true" className="w-6 h-6 object-contain" />
                  <span className="text-xs sm:text-sm">{g.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Group size section */}
        <div>
          <p className="text-xs sm:text-sm font-medium text-neutral-800 mb-2">
            Typical group size?
          </p>
          <div className="grid grid-cols-2 gap-2 bg-warm-100 p-2.5 rounded-xl">
            {GROUP_SIZES.map((g) => {
              const selected = formData.groupSize === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => updateData({ groupSize: g.id })}
                  aria-pressed={selected}
                  disabled={loading}
                  className={`text-left px-6 py-4 rounded-xl border transition-all disabled:opacity-50 ${
                    selected
                      ? "bg-teal-700 border-teal-700 text-white"
                      : "bg-white border-warm-300 text-neutral-800 hover:border-neutral-300"
                  }`}
                >
                  <p className="text-xs sm:text-sm font-semibold">{g.label}</p>
                  <p className={`text-xs mt-0.5 ${selected ? "text-teal-50" : "text-neutral-500"}`}>
                    {g.sublabel}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Complexity section */}
        <div>
          <p className="text-xs sm:text-sm font-medium text-neutral-800 mb-2">
            Preferred complexity?
          </p>
          <div className="flex gap-4 bg-warm-100 p-4 rounded-xl">
            {COMPLEXITIES.map((c) => {
              const selected = formData.complexity === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => updateData({ complexity: c.id })}
                  aria-pressed={selected}
                  disabled={loading}
                  className={`flex items-center gap-1.5 px-6 py-4 rounded-lg border text-sm font-medium transition-all w-36.25 disabled:opacity-50 ${
                    selected
                      ? "bg-teal-700 border-teal-700 text-white"
                      : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {c.dots > 0 && (
                    <span className="flex gap-0.5">
                      {[...Array(3)].map((_, i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor:
                              i < c.dots
                                ? selected ? "#ffffff" : "#6B4D33"
                                : selected ? "#54d8be" : "#E8D4C4",
                          }}
                        />
                      ))}
                    </span>
                  )}
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto flex gap-3 bg-warm-50 px-4 py-4 border border-warm-200">
        <div className="flex-1 [&>button]:w-full">
          <SecondaryButton
            label="Cancel"
            onClick={onBack}
            disabled={loading}
            leftIcon={<ChevronLeft size={16} aria-hidden="true" />}
          />
        </div>
        <div className="flex-1 [&>button]:w-full">
          <PrimaryButton
            label={loading ? "Saving..." : "Save changes"}
            onClick={onSave}
            disabled={!canSave || loading}
            isLoading={loading}
          />
        </div>
      </div>
    </>
  );
}
