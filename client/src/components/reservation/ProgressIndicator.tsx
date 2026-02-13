import React from "react";
import { StepIcon } from "../ui/StepIcon";
import { Calendar, Check, Dice6, MoveRight } from "lucide-react";

interface ProgressIndicatorProps {
  currentStep: number;
}

const steps = [
  { id: 1, text: "When", icon: <Calendar /> },
  { id: 2, text: "Games", icon: <Dice6 /> },
  { id: 3, text: "Confirm", icon: <Check /> },
];

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
}) => {
  return (
    <div
      className={` ${currentStep > 5 ? "hidden" : "flex"} items-center w-full justify-center gap-12 py-3 px-6 bg-[linear-gradient(180deg,var(--color-warm-50)_0%,var(--color-warm-100)_100%)] border-b-0.5 border-warm-200 `}
    >
      <StepIcon
        isCurrentStep={currentStep === 0}
        isStepCompleted={currentStep > 0}
        text={steps[0].text}
      >
        {steps[0].icon}
      </StepIcon>
      <MoveRight className="text-warm-300" />
      <StepIcon
        isCurrentStep={currentStep === 1}
        isStepCompleted={currentStep > 1}
        text={steps[1].text}
      >
        {steps[1].icon}
      </StepIcon>
      <MoveRight className="text-warm-300" />

      <StepIcon
        isCurrentStep={currentStep > 2}
        isStepCompleted={currentStep > 4}
        text={steps[2].text}
      >
        {steps[2].icon}
      </StepIcon>
    </div>
  );
};

export default ProgressIndicator;
