import { Check, Mail, Phone } from "lucide-react";
import { Card } from "../../ui/Card";
import type { AuthFormData } from "../../../hooks/useAuthModal";
import { PrimaryButton } from "../../ui/PrimaryButton";
import { TextButton } from "../../ui/TextButton";
import { COMPLEXITIES, GAME_TYPES } from "../../../utils/const";

const GROUP_LABELS: Record<string, string> = {
  any: "Any",
  duo: "Just the two of us",
  small: "3 – 4 players",
  big: "5 or more players",
};

const COMPLEXITY_LABELS: Record<string, string> = {
  any: "Any",
  light: "Light",
  medium: "Medium",
  heavy: "Heavy",
};

interface Props {
  formData: AuthFormData;
  onClose: () => void;
  onEdit: () => void;
}

export function StepSuccess({ formData, onClose, onEdit }: Props) {
  const firstName = formData.name.split(" ")[0];

  return (
    <>
      <div className="px-5 pt-6 pb-4 flex flex-col gap-4 flex-1 overflow-y-auto">
        {/* Check icon */}
        <div className="flex flex-col items-center gap-2 pt-2">
          <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center">
            <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center">
              <Check className="text-white" size={22} strokeWidth={3} aria-hidden="true" />
            </div>
          </div>
          <h2 id="auth-step-heading" className="text-xl sm:text-2xl font-bold text-neutral-800">
            Welcome, {firstName}!
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600">Your GATORE account is ready</p>
        </div>

        {/* Cards + edit profile container */}
        <div className="bg-warm-50 rounded-xl p-3 flex flex-col gap-3">
          {/* Contact info card */}
          <Card variant="default" padding="md" className="bg-white border-warm-300">
            <p className="text-xs font-semibold text-neutral-600 tracking-wider uppercase mb-3">
              Contact Info
            </p>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-amber-400 flex items-center justify-center shrink-0">
                <img src="icons/pawn.svg" alt="" aria-hidden="true" className="w-6 h-6 object-contain" style={{ filter: "brightness(0)" }} />
              </div>
              <div>
                <p className="text-base font-bold text-neutral-800">{formData.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Mail size={13} className="text-neutral-500" aria-hidden="true" />
                  <span className="text-sm text-neutral-600">{formData.email}</span>
                </div>
                {formData.phone && (
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Phone size={13} className="text-neutral-500" aria-hidden="true" />
                    <span className="text-sm text-neutral-600">{formData.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Preferences card */}
          {(formData.gameTypes.length > 0 ||
            formData.groupSize ||
            formData.complexity) && (
            <Card variant="default" padding="md" className="bg-white border-warm-300">
              <p className="text-xs font-semibold text-neutral-600 tracking-wider uppercase mb-3">
                Your Preferences
              </p>

              {formData.gameTypes.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-neutral-600 mb-2.5">Types of games</p>
                  <div className="flex flex-wrap gap-1.5">
                    {formData.gameTypes.map((g) => {
                      const type = GAME_TYPES.find((t) => t.id === g);
                      if (!type) return null;
                      return (
                        <span
                          key={g}
                          className="inline-flex items-center gap-1.5 bg-warm-100 border border-warm-300 text-neutral-700 text-sm font-medium px-2.5 py-1 rounded-full"
                        >
                          <img src={type.icon} alt="" aria-hidden="true" className="w-4 h-4 object-contain" />
                          {type.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="border-t border-warm-300 pt-3 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-600">Group size</p>
                  <p className="text-sm font-semibold text-neutral-800 mt-2">
                    {GROUP_LABELS[formData.groupSize] || "Any"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-neutral-600">Complexity</p>
                  <div className="flex items-center gap-1.5 mt-2">
                    {(() => {
                      const c = COMPLEXITIES.find((c) => c.id === formData.complexity);
                      return c && c.dots > 0 ? (
                        <span className="flex gap-0.5">
                          {[...Array(3)].map((_, i) => (
                            <span
                              key={i}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                backgroundColor: i < c.dots ? "#6B4D33" : "#E8D4C4",
                              }}
                            />
                          ))}
                        </span>
                      ) : null;
                    })()}
                    <p className="text-sm font-semibold text-neutral-800">
                      {COMPLEXITY_LABELS[formData.complexity] || "Any"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Edit profile link */}
          <div className="flex flex-col items-center gap-0">
            <p className="text-sm text-neutral-500">Need to make changes?</p>
            <TextButton label="Edit profile" size="small" onClick={onEdit} />
          </div>
        </div>
      </div>

      {/* CTA footer */}
      <div className="mt-auto bg-warm-50 px-4 py-4 border border-warm-200">
        <div className="[&>button]:w-full">
          <PrimaryButton label="Let's make a reservation" onClick={onClose} size="lg" />
        </div>
      </div>
    </>
  );
}
