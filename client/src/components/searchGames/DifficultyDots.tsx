interface Props {
  difficulty: string | null;
  dots: number;
  isTextWhite?: boolean;
  filledClass?: string;
  emptyClass?: string;
  textSizeClass?: string;
}

export function DifficultyDots({ difficulty, dots, isTextWhite, filledClass = "bg-warm-700", emptyClass = "bg-warm-300", textSizeClass = "text-xs sm:text-sm" }: Props) {
  const filled = Math.min(Math.max(Math.round(dots), 0), 5);

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[...Array(3)].map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < filled ? filledClass : emptyClass
            }`}
          />
        ))}
      </div>
      {difficulty && (
        <span
          className={`${textSizeClass} ${isTextWhite ? "text-white" : "text-gray-800"} font-semibold`}
        >
          {difficulty}
        </span>
      )}
    </div>
  );
}
