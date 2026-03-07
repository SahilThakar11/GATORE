import { useState } from "react";
import { Calendar, Clock, Users, ChevronDown } from "lucide-react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

const TIME_OPTIONS = [
  "5:00 PM",
  "5:30 PM",
  "6:00 PM",
  "6:30 PM",
  "7:00 PM",
  "7:30 PM",
  "8:00 PM",
  "8:30 PM",
];

const PLAYER_OPTIONS = [
  "1 player",
  "2 players",
  "3 players",
  "4 players",
  "5 players",
  "6 players",
  "7 players",
];

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface SelectProps {
  icon: React.ReactNode;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

function FilterSelect({ icon, value, options, onChange }: SelectProps) {
  return (
    <div className="relative flex-1 shadow-[0px_4px_4px_0px_rgba(186,186,186,0.15)]">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-800 pointer-events-none">
        {icon}
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none pl-9 pr-8 py-3 text-sm text-neutral-800 bg-white border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <ChevronDown
        size={15}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
    </div>
  );
}

interface FilterBarProps {
  onSearch?: (filters: { date: string; time: string; players: string }) => void;
}

export function FilterBar({ onSearch }: FilterBarProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("6:00 PM");
  const [players, setPlayers] = useState("4 players");

  return (
    <div className="w-full bg-warm-100 border-b border-warm-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-7 py-4">
        <div className="flex items-center gap-3">
          {/* Date — display only for now */}
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="bg-white shadow-[0px_4px_4px_0px_rgba(186,186,186,0.15)] border-warm-300 focus:ring-teal-500 cursor-pointer"
          />

          {/* Time */}
          <FilterSelect
            icon={<Clock size={16} />}
            value={time}
            options={TIME_OPTIONS}
            onChange={setTime}
          />

          {/* Players */}
          <FilterSelect
            icon={<Users size={16} />}
            value={players}
            options={PLAYER_OPTIONS}
            onChange={setPlayers}
          />

          {/* CTA */}
          <Button onClick={() => onSearch?.({ date, time, players })}>
            Find tables
          </Button>
        </div>
      </div>
    </div>
  );
}
