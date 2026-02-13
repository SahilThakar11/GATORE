import React from "react";

interface StepIconProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isCurrentStep: boolean;
  isStepCompleted: boolean;
  text: string;
  children?: React.ReactNode;
}

export const StepIcon: React.FC<StepIconProps> = ({
  isCurrentStep,
  isStepCompleted,
  text,
  children,
}) => {
  const variants = {
    current: "bg-teal-600 text-white",
    completed: "text-warm-700",
    default: "text-neutral-500",
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center ${isCurrentStep ? variants.current : isStepCompleted ? variants.completed : variants.default}`}
      >
        {children}
      </div>
      <div
        className={`self-stretch text-center justify-start  text-xs font-normal ${isCurrentStep ? "text-teal-600" : isStepCompleted ? variants.completed : variants.default}`}
      >
        {text}
      </div>
    </div>
  );
};
