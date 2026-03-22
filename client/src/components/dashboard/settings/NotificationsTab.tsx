import { useState } from "react";
import { Check } from "lucide-react";
import { SettingsPanel } from "./SettingsPanel";

interface NotifOption {
  key: string;
  label: string;
  desc: string;
  enabled: boolean;
}

export default function NotificationsTab({ onBack }: { onBack: () => void }) {
  const [emailNotifs, setEmailNotifs] = useState<NotifOption[]>([
    {
      key: "email_reservations",
      label: "New Reservations",
      desc: "Get notified when a new reservation is made",
      enabled: true,
    },
    {
      key: "email_cancellations",
      label: "Cancellations",
      desc: "Get notified when a reservation is cancelled",
      enabled: false,
    },
    {
      key: "email_daily",
      label: "Daily Reminders",
      desc: "Receive a daily summary of upcoming reservations",
      enabled: true,
    },
  ]);

  const [pushNotifs, setPushNotifs] = useState<NotifOption[]>([
    {
      key: "push_reservations",
      label: "New Reservations",
      desc: "Instant alerts for new bookings",
      enabled: true,
    },
    {
      key: "push_cancellations",
      label: "Cancellations",
      desc: "Instant alerts for cancellations",
      enabled: false,
    },
  ]);

  const toggleEmail = (key: string) =>
    setEmailNotifs((prev) =>
      prev.map((n) => (n.key === key ? { ...n, enabled: !n.enabled } : n))
    );

  const togglePush = (key: string) =>
    setPushNotifs((prev) =>
      prev.map((n) => (n.key === key ? { ...n, enabled: !n.enabled } : n))
    );

  return (
    <SettingsPanel
      title="Notification Preferences"
      subtitle="Choose how you want to be notified about reservations"
      onBack={onBack}
    >
      {/* Email Notifications */}
      <h3 className="text-sm font-bold text-gray-900 mb-3">
        Email Notifications
      </h3>
      <div className="flex flex-col gap-2 mb-8">
        {emailNotifs.map((n) => (
          <button
            key={n.key}
            onClick={() => toggleEmail(n.key)}
            className="flex items-center gap-3.5 border border-gray-200 rounded-xl px-4 py-3.5 text-left hover:bg-gray-50/50 transition-colors cursor-pointer"
          >
            <div
              className={`w-5 h-5 rounded flex items-center justify-center border-2 shrink-0 transition-colors ${
                n.enabled
                  ? "bg-teal-600 border-teal-600"
                  : "border-gray-300"
              }`}
            >
              {n.enabled && <Check size={13} className="text-white" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{n.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{n.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Push Notifications */}
      <h3 className="text-sm font-bold text-gray-900 mb-3">
        Push Notifications
      </h3>
      <div className="flex flex-col gap-2">
        {pushNotifs.map((n) => (
          <button
            key={n.key}
            onClick={() => togglePush(n.key)}
            className="flex items-center gap-3.5 border border-gray-200 rounded-xl px-4 py-3.5 text-left hover:bg-gray-50/50 transition-colors cursor-pointer"
          >
            <div
              className={`w-5 h-5 rounded flex items-center justify-center border-2 shrink-0 transition-colors ${
                n.enabled
                  ? "bg-teal-600 border-teal-600"
                  : "border-gray-300"
              }`}
            >
              {n.enabled && <Check size={13} className="text-white" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{n.label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{n.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </SettingsPanel>
  );
}
