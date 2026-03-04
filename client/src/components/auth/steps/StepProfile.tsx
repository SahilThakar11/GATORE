import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import type { AuthFormData } from "../../../hooks/useAuthModal";

interface Props {
  formData: AuthFormData;
  updateData: (patch: Partial<AuthFormData>) => void;
  onContinue: () => void;
  onBack: () => void;
}

export function StepProfile({
  formData,
  updateData,
  onContinue,
  onBack,
}: Props) {
  const isValid = formData.name.trim().length > 0;

  return (
    <>
      <div className="px-5 pt-5 pb-4 flex flex-col gap-5 flex-1">
        <div>
          <h2 className="text-2xl font-bold text-neutral-800">
            Tell us about yourself
          </h2>
          <p className="text-sm text-neutral-600 mt-1">
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
          placeholder="For reservation reminders"
          value={formData.phone}
          onChange={(e) => updateData({ phone: e.target.value })}
        />
      </div>
      <div className="mt-auto flex gap-3 bg-warm-50 px-4 py-4 border border-warm-200">
        <Button variant="outline" fullWidth onClick={onBack}>
          Back
        </Button>
        <Button
          variant="primary"
          fullWidth
          onClick={onContinue}
          disabled={!isValid}
        >
          Continue
        </Button>
      </div>
    </>
  );
}
