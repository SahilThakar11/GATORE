import React from "react";

interface FilterPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}

export function FilterPill({ label, active, onClick, icon }: FilterPillProps) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-1.5 text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
        active
          ? "bg-teal-600 border-teal-600 text-white"
          : "bg-white border-gray-200 text-gray-600 hover:border-teal-300 hover:text-teal-600"
      }`}
    >
      {icon && <span aria-hidden="true" className="flex items-center shrink-0">{icon}</span>}
      {label}
    </button>
  );
}
