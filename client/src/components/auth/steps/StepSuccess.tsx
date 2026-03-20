import { Check, Mail, Phone } from "lucide-react";
import { Card } from "../../ui/Card";
import type { AuthFormData } from "../../../hooks/useAuthModal";
import { Button } from "../../ui/Button";

const GAME_LABELS: Record<string, string> = {
  strategy: "Strategy",
  party: "Party",
  card: "Card Games",
  puzzle: "Puzzle",
  coop: "Co-op",
  rpg: "RPG",
  educational: "Educational",
  tableau: "Tableau",
  deduction: "Deduction",
};

const GAME_ICONS: Record<string, string> = {
  strategy: "♟",
  party: "🎉",
  card: "🃏",
  puzzle: "🧩",
  coop: "🤝",
  rpg: "🎲",
  educational: "🎓",
  tableau: "⊞",
  deduction: "🔍",
};

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
}

export function StepSuccess({ formData, onClose }: Props) {
  const firstName = formData.name.split(" ")[0];

  return (
    <div className="px-5 pt-6 pb-4 flex flex-col gap-4 flex-1">
      {/* Check icon */}
      <div className="flex flex-col items-center gap-2 pt-2">
        <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center">
            <Check className="text-white" size={22} strokeWidth={3} />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome, {firstName}
        </h2>
        <p className="text-sm text-gray-500">Your GATORE account is ready</p>
      </div>

      {/* Contact info card */}
      <Card variant="default" padding="md">
        <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-3">
          Contact Info
        </p>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-400 flex items-center justify-center text-white shrink-0">
            ♟
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{formData.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Mail size={12} className="text-gray-400" />
              <span className="text-xs text-gray-500">{formData.email}</span>
            </div>
            {formData.phone && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <Phone size={12} className="text-gray-400" />
                <span className="text-xs text-gray-500">{formData.phone}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Preferences card */}
      {(formData.gameTypes.length > 0 ||
        formData.groupSize ||
        formData.complexity) && (
        <Card variant="default" padding="md">
          <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-3">
            Your Preferences
          </p>

          {formData.gameTypes.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1.5">Types of games</p>
              <div className="flex flex-wrap gap-1.5">
                {formData.gameTypes.map((g) => (
                  <span
                    key={g}
                    className="inline-flex items-center gap-1 bg-pink-50 border border-pink-100 text-pink-700 text-xs font-medium px-2.5 py-1 rounded-full"
                  >
                    <span>{GAME_ICONS[g]}</span>
                    {GAME_LABELS[g]}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-gray-100 pt-3 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-400">Group size</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {GROUP_LABELS[formData.groupSize] || "Any"}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Complexity</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">
                {COMPLEXITY_LABELS[formData.complexity] || "Any"}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Edit profile link */}
      <p className="text-center text-sm text-gray-500">
        Need to make changes?{" "}
        <button className="text-teal-700 font-medium hover:underline">
          Edit profile
        </button>
      </p>

      {/* CTA */}
      <Button variant="primary" fullWidth onClick={onClose} size="lg">
        Let's make a reservation
      </Button>
    </div>
  );
}
