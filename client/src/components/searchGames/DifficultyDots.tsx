interface Props {
  difficulty: string | null;
  dots: number;
}

const COLOR: Record<string, string> = {
  Light: "bg-green-500",
  Medium: "bg-amber-400",
  Hard: "bg-orange-500",
  "Very Hard": "bg-red-500",
};

export function DifficultyDots({ difficulty, dots }: Props) {
  const filled = Math.min(Math.max(Math.round(dots), 0), 5);
  const color = COLOR[difficulty ?? ""] ?? "bg-gray-400";

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {[...Array(3)].map((_, i) => (
          <span
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < filled ? color : "bg-white"
            }`}
          />
        ))}
      </div>
      {difficulty && (
        <span className="text-xs text-white font-medium">{difficulty}</span>
      )}
    </div>
  );
}
