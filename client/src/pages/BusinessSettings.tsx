import { useState } from "react";
import {
  Building2,
  DollarSign,
  Armchair,
  Clock,
  User,
  Dices,
} from "lucide-react";

import BusinessLayout from "../components/dashboard/BusinessLayout";
import BusinessInfoTab from "../components/dashboard/settings/BusinessInfoTab";
import PricingTab from "../components/dashboard/settings/PricingTab";
import TablesTab from "../components/dashboard/settings/TablesTab";
import OperatingHoursTab from "../components/dashboard/settings/OperatingHoursTab";
import AccountTab from "../components/dashboard/settings/AccountTab";
import GameLibraryTab from "../components/dashboard/settings/GameLibraryTab";

/* ═══════════════════════════════════════════════════════════════════
   SETTINGS NAV TABS
   ═══════════════════════════════════════════════════════════════════ */

const SETTINGS_TABS = [
  { key: "info", label: "Business Info", icon: Building2 },
  { key: "pricing", label: "Pricing", icon: DollarSign },
  { key: "tables", label: "Tables", icon: Armchair },
  { key: "games", label: "Game Library", icon: Dices },
  { key: "hours", label: "Operating Hours", icon: Clock },
  { key: "account", label: "Account", icon: User },
] as const;

type TabKey = (typeof SETTINGS_TABS)[number]["key"];

/* ═══════════════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════════════ */

export default function BusinessSettings() {
  const [activeTab, setActiveTab] = useState<TabKey>("info");

  const renderTab = () => {
    const back = () => setActiveTab("info");
    switch (activeTab) {
      case "info":
        return <BusinessInfoTab onBack={back} />;
      case "pricing":
        return <PricingTab onBack={back} />;
      case "tables":
        return <TablesTab onBack={back} />;
      case "games":
        return <GameLibraryTab onBack={back} />;
      case "hours":
        return <OperatingHoursTab onBack={back} />;
      case "account":
        return <AccountTab onBack={back} />;
    }
  };

  return (
    <BusinessLayout>
      <div className="flex h-screen">
        {/* ── Settings Sub-Nav ────────────────────────────────── */}
        <div className="w-56 shrink-0 bg-warm-100 border-r border-warm-200 px-4 py-7">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-neutral-800">Settings</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Configure your business
            </p>
          </div>

          <nav className="flex flex-col gap-1">
            {SETTINGS_TABS.map(({ key, label, icon: Icon }) => {
              const active = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer text-left ${
                    active
                      ? "bg-teal-700 text-white"
                      : "text-neutral-600 hover:bg-warm-200 hover:text-neutral-800"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* ── Content Area ────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-7 bg-warm-50">
          {renderTab()}
        </div>
      </div>
    </BusinessLayout>
  );
}
