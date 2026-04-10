import { useState } from "react";
import { Clock, Users } from "lucide-react";
import { Input } from "../ui/Input";
import { PrimaryButton } from "../ui/PrimaryButton";
import { Dropdown } from "../ui/Dropdown";

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

function FilterDropdown({
  icon,
  value,
  options,
  onChange,
}: {
  icon: React.ReactNode;
  value: string;
  options: string[];
  onChange: (val: string) => void;
}) {
  return (
    <div className="w-full shadow-[0px_4px_4px_0px_rgba(186,186,186,0.15)]">
      <Dropdown
        trigger="label"
        triggerIcon={icon}
        triggerLabel={value}
        fullWidth
        onBackground="warm"
        items={options.map((opt) => ({ label: opt, onClick: () => onChange(opt) }))}
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
      <div className="max-w-7xl mx-auto px-4 sm:px-7 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Inputs — 2-col on mobile, inline on sm+ */}
          <div className="grid grid-cols-2 sm:flex sm:flex-1 gap-3">
            {/* Date */}
            <div className="sm:flex-1">
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="bg-white shadow-[0px_4px_4px_0px_rgba(186,186,186,0.15)] border-warm-300 focus:ring-teal-500 cursor-pointer"
              />
            </div>

            {/* Time */}
            <div className="sm:flex-1">
              <FilterDropdown
                icon={<Clock size={16} />}
                value={time}
                options={TIME_OPTIONS}
                onChange={setTime}
              />
            </div>

            {/* Players — spans full width on mobile, normal on sm+ */}
            <div className="col-span-2 sm:col-span-1 sm:flex-1">
              <FilterDropdown
                icon={<Users size={16} />}
                value={players}
                options={PLAYER_OPTIONS}
                onChange={setPlayers}
              />
            </div>
          </div>

          {/* CTA */}
          <PrimaryButton
            label="Find tables"
            onClick={() => onSearch?.({ date, time, players })}
            size="sm"
          />
        </div>
      </div>
    </div>
  );
}
