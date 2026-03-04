import { Button } from "../../ui/Button";
import type { AuthFormData } from "../../../hooks/useAuthModal";
import { GAME_TYPES, GROUP_SIZES, COMPLEXITIES } from "../../../utils/const";
interface Props {
  formData: AuthFormData;
  updateData: (patch: Partial<AuthFormData>) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function StepPreferences({
  formData,
  updateData,
  onContinue,
  onBack,
}: Props) {
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
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-800">
              Game preferences
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              Help us recommend games you'll love
            </p>
          </div>
          <span className="text-xs font-medium bg-warm-200 text-neutral-800 px-2.5 py-1 rounded-lg shrink-0 mt-1">
            Optional
          </span>
        </div>

        {/* Game types */}
        <div>
          <p className="text-sm font-medium text-neutral-800 mb-2">
            What types of games do you enjoy?
          </p>
          <div className="grid grid-cols-3 gap-2">
            {GAME_TYPES.map((g) => {
              const selected = formData.gameTypes.includes(g.id);
              return (
                <button
                  key={g.id}
                  onClick={() => toggleGame(g.id)}
                  className={`flex flex-col items-center justify-center gap-1.5 py-3 px-2 rounded-xl border text-sm font-normal transition-all cursor-pointer ${
                    selected
                      ? `${g.color} text-neutral-600 hover:opacity-80`
                      : "border-warm-200 bg-white text-neutral-600"
                  }`}
                >
                  <img src={g.icon} alt={g.label} className="w-4 h-4" />
                  <span className="text-xs">{g.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Group size */}
        <div>
          <p className="text-sm font-medium text-neutral-800 mb-2">
            Typical group size?
          </p>
          <div className="grid grid-cols-2 gap-2 bg-warm-100 p-2.5 rounded-xl">
            {GROUP_SIZES.map((g) => {
              const selected = formData.groupSize === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => updateData({ groupSize: g.id })}
                  className={`text-left px-6 py-4 rounded-xl border transition-all w-78.5 ${
                    selected
                      ? "bg-teal-600 border-teal-600 text-white"
                      : "bg-white border-warm-300 text-neutral-800 hover:border-neutral-300"
                  }`}
                >
                  <p className="text-sm font-semibold">{g.label}</p>
                  <p
                    className={`text-xs mt-0.5 ${selected ? "text-teal-100" : "text-neutral-500"}`}
                  >
                    {g.sublabel}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Complexity */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">
            Preferred complexity?
          </p>
          <div className="flex gap-4 bg-warm-100 p-4 rounded-xl">
            {COMPLEXITIES.map((c) => {
              const selected = formData.complexity === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => updateData({ complexity: c.id })}
                  className={`flex items-center gap-1.5 px-6 py-4 rounded-lg border text-sm font-medium transition-all w-36.25 ${
                    selected
                      ? "bg-teal-600 border-teal-600 text-white"
                      : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {c.dots > 0 && (
                    <span className="flex gap-0.5">
                      {[...Array(3)].map((_, i) => (
                        <span
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full ${
                            i < c.dots
                              ? selected
                                ? "bg-warm-700"
                                : "bg-warm-700"
                              : selected
                                ? "bg-warm-300"
                                : "bg-warm-300"
                          }`}
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

        {/* Skip */}
        <button className="text-sm text-neutral-400 underline underline-offset-2 hover:text-neutral-600 text-center">
          Skip
        </button>
      </div>
      <div className="mt-auto flex gap-3 bg-warm-50 px-4 py-4 border border-warm-200">
        <Button variant="outline" fullWidth onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" fullWidth onClick={onContinue}>
          Continue
        </Button>
      </div>
    </>
  );
}
