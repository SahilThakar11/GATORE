import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { SettingsPanel } from "./SettingsPanel";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TIME_OPTIONS = [
  "6:00 AM", "7:00 AM", "8:00 AM", "9:00 AM", "10:00 AM",
  "11:00 AM", "12:00 PM", "1:00 PM", "2:00 PM", "3:00 PM",
  "4:00 PM", "5:00 PM", "6:00 PM", "7:00 PM", "8:00 PM",
  "9:00 PM", "10:00 PM", "11:00 PM", "12:00 AM",
];

interface DayHours {
  enabled: boolean;
  open: string;
  close: string;
}

const DEFAULT_HOURS: Record<string, DayHours> = {
  Monday: { enabled: true, open: "10:00 AM", close: "10:00 PM" },
  Tuesday: { enabled: true, open: "10:00 AM", close: "10:00 PM" },
  Wednesday: { enabled: true, open: "9:00 AM", close: "9:00 PM" },
  Thursday: { enabled: true, open: "11:00 AM", close: "11:00 PM" },
  Friday: { enabled: true, open: "10:00 AM", close: "10:00 PM" },
  Saturday: { enabled: true, open: "9:00 AM", close: "9:00 PM" },
  Sunday: { enabled: true, open: "11:00 AM", close: "11:00 PM" },
};

export default function OperatingHoursTab({ onBack }: { onBack: () => void }) {
  const [hours, setHours] = useState<Record<string, DayHours>>(DEFAULT_HOURS);

  const updateDay = (day: string, patch: Partial<DayHours>) =>
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));

  const applyToAll = () => {
    const monday = hours["Monday"];
    const updated: Record<string, DayHours> = {};
    DAYS.forEach((d) => (updated[d] = { ...monday }));
    setHours(updated);
  };

  return (
    <SettingsPanel
      title="Operating Hours"
      subtitle="Set your business hours for each day of the week"
      onBack={onBack}
    >
      {/* Apply-to-all bar */}
      <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 mb-5">
        <p className="text-sm text-gray-500">
          Use Monday's hours for all days
        </p>
        <button
          onClick={applyToAll}
          className="text-sm font-semibold text-gray-700 border border-gray-200 px-4 py-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Apply to all
        </button>
      </div>

      {/* Day rows */}
      <div className="flex flex-col gap-3">
        {DAYS.map((day) => {
          const h = hours[day];
          return (
            <div
              key={day}
              className="flex items-center gap-4 border border-gray-100 rounded-xl px-4 py-3"
            >
              {/* Checkbox */}
              <button
                onClick={() => updateDay(day, { enabled: !h.enabled })}
                className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors shrink-0 cursor-pointer ${
                  h.enabled
                    ? "bg-teal-600 border-teal-600"
                    : "border-gray-300"
                }`}
              >
                {h.enabled && <Check size={13} className="text-white" />}
              </button>

              {/* Day name */}
              <span className="text-sm font-medium text-gray-700 w-24">
                {day}
              </span>

              {/* Open time */}
              <div className="flex-1 relative">
                <select
                  value={h.open}
                  onChange={(e) => updateDay(day, { open: e.target.value })}
                  disabled={!h.enabled}
                  className="w-full appearance-none px-3 py-2.5 border border-warm-200 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer disabled:opacity-40 bg-white"
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>

              <span className="text-xs text-gray-400">to</span>

              {/* Close time */}
              <div className="flex-1 relative">
                <select
                  value={h.close}
                  onChange={(e) => updateDay(day, { close: e.target.value })}
                  disabled={!h.enabled}
                  className="w-full appearance-none px-3 py-2.5 border border-warm-200 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer disabled:opacity-40 bg-white"
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
          );
        })}
      </div>
    </SettingsPanel>
  );
}
