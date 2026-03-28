import { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import { SettingsPanel } from "./SettingsPanel";
import { SecondaryButton } from "../../ui/SecondaryButton";
import {
  useBusinessSettings,
  type HoursConfig,
  minutesToTimeString,
  timeStringToMinutes,
} from "../../../hooks/useBusinessSettings";

const DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday",
  "Friday", "Saturday", "Sunday",
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

// "10:00 AM" → "10:00" (HH:MM 24h for <input type="time">)
function toInputTime(ampm: string): string {
  const [time, period] = ampm.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (period === "AM" && h === 12) h = 0;
  if (period === "PM" && h !== 12) h += 12;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// "13:00" → "1:00 PM"
function fromInputTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

export default function OperatingHoursTab({ onBack }: { onBack: () => void }) {
  const { fetchHours, updateHours, saving } = useBusinessSettings();
  const [hours, setHours] = useState<Record<string, DayHours>>(DEFAULT_HOURS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHours().then((data: HoursConfig[]) => {
      if (data.length > 0) {
        const mapped: Record<string, DayHours> = {};
        data.forEach((h) => {
          mapped[h.dayOfWeek] = {
            enabled: !h.isClosed,
            open: minutesToTimeString(h.openTime),
            close: minutesToTimeString(h.closeTime),
          };
        });
        DAYS.forEach((day) => {
          if (!mapped[day]) mapped[day] = DEFAULT_HOURS[day];
        });
        setHours(mapped);
      }
      setLoading(false);
    });
  }, [fetchHours]);

  const updateDay = (day: string, patch: Partial<DayHours>) =>
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));

  const applyToAll = () => {
    const monday = hours["Monday"];
    const updated: Record<string, DayHours> = {};
    DAYS.forEach((d) => (updated[d] = { ...monday }));
    setHours(updated);
  };

  const handleSave = async (): Promise<boolean> => {
    const hoursArray = DAYS.map((day) => ({
      dayOfWeek: day,
      openTime: timeStringToMinutes(hours[day].open),
      closeTime: timeStringToMinutes(hours[day].close),
      isClosed: !hours[day].enabled,
    }));
    const result = await updateHours(hoursArray);
    return result?.success ?? false;
  };

  if (loading) {
    return (
      <SettingsPanel title="Operating Hours" subtitle="Set your business hours for each day of the week" onBack={onBack}>
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-teal-600" />
        </div>
      </SettingsPanel>
    );
  }

  return (
    <SettingsPanel
      title="Operating Hours"
      subtitle="Set your business hours for each day of the week"
      onBack={onBack}
      onSave={handleSave}
      saving={saving}
    >
      {/* Apply-to-all bar */}
      <div className="flex items-center justify-between border border-warm-200 rounded-xl bg-white px-4 py-3 mb-5">
        <p className="text-sm text-neutral-600">
          Use Monday's hours for all days
        </p>
        <SecondaryButton label="Apply to all" onClick={applyToAll} size="xs" />
      </div>

      {/* Day rows */}
      <div className="flex flex-col gap-2.5">
        {DAYS.map((day) => {
          const h = hours[day];
          return (
            <div
              key={day}
              className="flex items-center gap-3 border border-warm-200 rounded-xl px-3 py-2.5 bg-warm-50"
            >
              {/* Checkbox + day name */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateDay(day, { enabled: !h.enabled })}
                  aria-pressed={h.enabled}
                  aria-label={`${h.enabled ? "Disable" : "Enable"} ${day}`}
                  className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors shrink-0 cursor-pointer ${
                    h.enabled
                      ? "bg-teal-600 border-teal-600"
                      : "border-warm-300"
                  }`}
                >
                  {h.enabled && <Check size={13} className="text-white" strokeWidth={3} aria-hidden="true" />}
                </button>
                <span className="text-sm font-medium text-neutral-700 w-24">
                  {day}
                </span>
              </div>

              {/* Time inputs */}
              <div className={`flex items-center gap-2 flex-1 ${!h.enabled ? "opacity-40 pointer-events-none" : ""}`}>
                <input
                  type="time"
                  value={toInputTime(h.open)}
                  onChange={(e) => e.target.value && updateDay(day, { open: fromInputTime(e.target.value) })}
                  disabled={!h.enabled}
                  aria-label={`${day} opening time`}
                  className="flex-1 px-3 py-3 border border-warm-300 rounded-lg text-sm text-neutral-700 outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-40 bg-white cursor-pointer"
                />
                <span className="text-xs text-neutral-600 shrink-0">to</span>
                <input
                  type="time"
                  value={toInputTime(h.close)}
                  onChange={(e) => e.target.value && updateDay(day, { close: fromInputTime(e.target.value) })}
                  disabled={!h.enabled}
                  aria-label={`${day} closing time`}
                  className="flex-1 px-3 py-3 border border-warm-300 rounded-lg text-sm text-neutral-700 outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-40 bg-white cursor-pointer"
                />
              </div>
            </div>
          );
        })}
      </div>
    </SettingsPanel>
  );
}
