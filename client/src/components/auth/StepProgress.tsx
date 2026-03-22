interface StepProgressProps {
  current: number;
  total: number;
}

export function StepProgress({ current, total }: StepProgressProps) {
  const percent = Math.round((current / total) * 100);
  return (
    <div className="px-5.5 py-3.5 bg-linear-to-b from-warm-50 to-warm-100 border border-warm-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-neutral-500">
          Step {current} of {total}
        </span>
        <span className="text-xs font-semibold text-teal-700">{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Registration progress: step ${current} of ${total}`}
        className="w-full h-1.5 bg-warm-200 rounded-full overflow-hidden"
      >
        <div
          className="h-full bg-teal-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
