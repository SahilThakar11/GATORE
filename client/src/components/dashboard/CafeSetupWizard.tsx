import { useState, useEffect } from "react";
import {
  X,
  ChevronDown,
  Plus,
  Trash2,
  Check,
  Globe,
  Upload,
  Link,
  Search,
  PlusCircle,
  ClipboardList,
  Clock,
  Zap,
  CreditCard,
  Calendar,
  Users,
  Settings,
} from "lucide-react";
import { StepProgress } from "../auth/StepProgress";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import gatoreLogo from "/logo.png";

/* ═══════════════════════════════════════════════════════════════════
   TYPES & CONSTANTS
   ═══════════════════════════════════════════════════════════════════ */

type WizardStep =
  | "business-info"
  | "tables"
  | "hours"
  | "games"
  | "menu"
  | "pricing"
  | "success";

const STEP_MAP: Record<WizardStep, { stepNum: number; total: number }> = {
  "business-info": { stepNum: 1, total: 3 },
  tables: { stepNum: 2, total: 3 },
  hours: { stepNum: 2, total: 3 },
  games: { stepNum: 2, total: 3 },
  menu: { stepNum: 2, total: 3 },
  pricing: { stepNum: 2, total: 3 },
  success: { stepNum: 3, total: 3 },
};

const DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday",
  "Friday", "Saturday", "Sunday",
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

interface TableEntry {
  id: string;
  name: string;
  capacity: string;
  type: string;
}

/* ═══════════════════════════════════════════════════════════════════
   SHARED SELECT FIELD
   ═══════════════════════════════════════════════════════════════════ */

function SelectField({
  label,
  options,
  value,
  onChange,
}: {
  label?: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-neutral-800">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none px-4 py-3 border border-warm-200 rounded-lg text-sm text-gray-600 outline-none transition-colors focus:ring-2 focus:ring-teal-500 cursor-pointer bg-white"
        >
          <option value="">Default Option</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STEP 1 — BUSINESS INFO
   ═══════════════════════════════════════════════════════════════════ */

function StepBusinessInfo({
  onContinue,
  onBack,
}: {
  onContinue: () => void;
  onBack: () => void;
}) {
  return (
    <div className="px-7 py-6 flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Set up your business account for{" "}
          <span className="text-gray-900">{"{Business Name}"}</span>
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Let's get your café ready for reservations
        </p>
      </div>

      <Input
        label="Email Address"
        type="email"
        placeholder="contact@yourbusiness.com"
      />
      <Input label="Contact Name" placeholder="contact@yourbusiness.com" />
      <Input
        label="Business Website"
        placeholder="https://www.yourbusiness.com/contact"
        rightIcon={<Globe size={16} />}
      />

      <div className="grid grid-cols-2 gap-4">
        <SelectField
          label="Business Type"
          options={["Board Game Café", "Restaurant", "Bar", "Lounge", "Other"]}
          value=""
          onChange={() => {}}
        />
        <Input
          label="Phone Number"
          type="tel"
          placeholder="(555) 123-4567"
        />
      </div>

      {/* Business Address */}
      <h3 className="text-base font-bold text-gray-900 mt-2">
        Business Address
      </h3>
      <Input label="Street Address" placeholder="123 Main Street" />
      <div className="grid grid-cols-3 gap-4">
        <Input label="City" placeholder="City" />
        <Input label="Province" placeholder="Province" />
        <Input label="Postal Code" placeholder="Postal Code" />
      </div>

      {/* Footer buttons */}
      <div className="flex gap-3 mt-2">
        <Button variant="outline" fullWidth onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" fullWidth onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STEP 2 — TABLES & SEATING
   ═══════════════════════════════════════════════════════════════════ */

function StepTables({
  onContinue,
  onBack,
}: {
  onContinue: () => void;
  onBack: () => void;
}) {
  const [tables, setTables] = useState<TableEntry[]>([
    { id: "1", name: "Table 1", capacity: "", type: "" },
    { id: "2", name: "Table 2", capacity: "2", type: "" },
  ]);

  const updateTable = (id: string, patch: Partial<TableEntry>) =>
    setTables((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
    );

  const removeTable = (id: string) =>
    setTables((prev) => prev.filter((t) => t.id !== id));

  const addTable = () => {
    const nextNum = tables.length + 1;
    setTables((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: `Table ${nextNum}`,
        capacity: "",
        type: "",
      },
    ]);
  };

  return (
    <div className="px-7 py-6 flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Tables & Seating</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Configure your tables for customer reservations
        </p>
      </div>

      {/* Table cards */}
      <div className="flex flex-col gap-4">
        {tables.map((t) => (
          <div
            key={t.id}
            className="border border-gray-200 rounded-xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-gray-900">{t.name}</h4>
              <button
                onClick={() => removeTable(t.id)}
                className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Table Name"
                placeholder={t.name}
                value={t.name}
                onChange={(e) => updateTable(t.id, { name: e.target.value })}
              />
              <SelectField
                label="Capacity"
                options={["2", "4", "6", "8", "10", "12"]}
                value={t.capacity}
                onChange={(v) => updateTable(t.id, { capacity: v })}
              />
              <SelectField
                label="Table Type"
                options={["Round", "Square", "Booth", "High-Top"]}
                value={t.type}
                onChange={(v) => updateTable(t.id, { type: v })}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Add another table */}
      <button
        onClick={addTable}
        className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-teal-600 hover:border-teal-300 hover:bg-teal-50/50 transition-all cursor-pointer"
      >
        <Plus size={15} />
        Add another table
      </button>

      {/* Tip */}
      <div className="bg-amber-50 border-l-4 border-amber-300 rounded-r-lg pl-4 pr-4 py-3">
        <p className="text-xs text-gray-600">
          <span className="font-bold text-amber-700">Tip:</span> You can always
          add, remove, or modify tables later from your dashboard settings.
        </p>
      </div>

      {/* Footer */}
      <div className="flex gap-3 mt-1">
        <Button variant="outline" fullWidth onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" fullWidth onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STEP 3 — OPERATING HOURS
   ═══════════════════════════════════════════════════════════════════ */

function StepHours({
  onContinue,
  onBack,
}: {
  onContinue: () => void;
  onBack: () => void;
}) {
  const [hours, setHours] = useState<Record<string, DayHours>>({
    Monday: { enabled: true, open: "10:00 AM", close: "10:00 PM" },
    Tuesday: { enabled: true, open: "10:00 AM", close: "10:00 PM" },
    Wednesday: { enabled: true, open: "9:00 AM", close: "9:00 PM" },
    Thursday: { enabled: true, open: "11:00 AM", close: "11:00 PM" },
    Friday: { enabled: true, open: "10:00 AM", close: "10:00 PM" },
    Saturday: { enabled: true, open: "9:00 AM", close: "9:00 PM" },
    Sunday: { enabled: true, open: "11:00 AM", close: "11:00 PM" },
  });

  const updateDay = (day: string, patch: Partial<DayHours>) =>
    setHours((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));

  const applyToAll = () => {
    const monday = hours["Monday"];
    const updated: Record<string, DayHours> = {};
    DAYS.forEach((d) => (updated[d] = { ...monday }));
    setHours(updated);
  };

  return (
    <div className="px-7 py-6 flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Operating Hours</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Set your business hours for each day of the week
        </p>
      </div>

      {/* Apply to all */}
      <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
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
      <div className="flex flex-col gap-2.5">
        {DAYS.map((day) => {
          const h = hours[day];
          return (
            <div
              key={day}
              className="flex items-center gap-3 border border-gray-100 rounded-xl px-3 py-2.5"
            >
              <button
                onClick={() => updateDay(day, { enabled: !h.enabled })}
                className={`w-5 h-5 rounded flex items-center justify-center border-2 shrink-0 cursor-pointer transition-colors ${
                  h.enabled
                    ? "bg-teal-600 border-teal-600"
                    : "border-gray-300"
                }`}
              >
                {h.enabled && <Check size={13} className="text-white" />}
              </button>

              <span className="text-sm font-medium text-gray-700 w-24">
                {day}
              </span>

              <div className="flex-1 relative">
                <select
                  value={h.open}
                  onChange={(e) => updateDay(day, { open: e.target.value })}
                  disabled={!h.enabled}
                  className="w-full appearance-none px-3 py-2 border border-warm-200 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer disabled:opacity-40 bg-white"
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              <span className="text-xs text-gray-400">to</span>

              <div className="flex-1 relative">
                <select
                  value={h.close}
                  onChange={(e) => updateDay(day, { close: e.target.value })}
                  disabled={!h.enabled}
                  className="w-full appearance-none px-3 py-2 border border-warm-200 rounded-lg text-sm text-gray-700 outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer disabled:opacity-40 bg-white"
                >
                  {TIME_OPTIONS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Note */}
      <div className="bg-teal-50 border-l-4 border-teal-300 rounded-r-lg pl-4 pr-4 py-3">
        <p className="text-xs text-gray-600">
          <span className="font-bold text-teal-700">Note:</span> These hours
          will be displayed to customers when they book reservations. You can
          adjust them anytime from your settings.
        </p>
      </div>

      {/* Footer */}
      <div className="flex gap-3 mt-1">
        <Button variant="outline" fullWidth onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" fullWidth onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STEP 4 — GAME LIBRARY
   ═══════════════════════════════════════════════════════════════════ */

function StepGames({
  onContinue,
  onBack,
}: {
  onContinue: () => void;
  onBack: () => void;
}) {
  const options = [
    {
      icon: Upload,
      iconBg: "bg-teal-50 text-teal-600",
      title: "Upload CSV File",
      desc: "Import your entire game library at once using a CSV file. Download the template to get started.",
    },
    {
      icon: Link,
      iconBg: "bg-amber-50 text-amber-600",
      title: "Import from Board Game Geek",
      desc: "Connect your BoardGameGeek account to automatically import your collection.",
    },
    {
      icon: Search,
      iconBg: "bg-purple-50 text-purple-600",
      title: "Search & Add Manually",
      desc: "Search BoardGameGeek and add games one at a time to build your library.",
    },
  ];

  return (
    <div className="px-7 py-6 flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Game Library</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Add your board game collection so customers know what games are
          available to play.
        </p>
      </div>

      <h3 className="text-base font-bold text-gray-900">
        How would you like to add your games?
      </h3>

      <div className="flex flex-col gap-2">
        {options.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.title}
              className="flex items-center gap-4 border border-gray-200 rounded-xl px-4 py-4 text-left hover:bg-gray-50/50 hover:border-gray-300 transition-all cursor-pointer"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${opt.iconBg}`}
              >
                <Icon size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{opt.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                  {opt.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex gap-3 mt-2">
        <Button variant="outline" fullWidth onClick={onBack}>
          Back
        </Button>
        <Button variant="outline" fullWidth onClick={onContinue}>
          Skip for Now
        </Button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STEP 5 — MENU SETUP
   ═══════════════════════════════════════════════════════════════════ */

function StepMenu({
  onFinish,
  onBack,
}: {
  onFinish: () => void;
  onBack: () => void;
}) {
  const menuOptions = [
    {
      icon: Upload,
      iconBg: "bg-teal-50 text-teal-600",
      title: "Upload PDF",
      desc: "Upload an existing menu PDF",
    },
    {
      icon: PlusCircle,
      iconBg: "bg-amber-50 text-amber-600",
      title: "Add Items Manually",
      desc: "Create your menu item by item",
    },
    {
      icon: ClipboardList,
      iconBg: "bg-purple-50 text-purple-600",
      title: "Start with Template",
      desc: "Choose from pre-built menu templates",
    },
  ];

  return (
    <div className="px-7 py-6 flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Menu Setup</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Add your menu so customers can browse while making reservations
          (Optional)
        </p>
      </div>

      <h3 className="text-base font-bold text-gray-900">
        How would you like to add your games?
      </h3>

      <div className="flex flex-col gap-2">
        {menuOptions.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.title}
              className="flex items-center gap-4 border border-gray-200 rounded-xl px-4 py-4 text-left hover:bg-gray-50/50 hover:border-gray-300 transition-all cursor-pointer"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${opt.iconBg}`}
              >
                <Icon size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{opt.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-snug">
                  {opt.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex gap-3 mt-2">
        <Button variant="outline" fullWidth onClick={onBack}>
          Back
        </Button>
        <Button variant="outline" fullWidth onClick={onFinish}>
          Skip for Now
        </Button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STEP 6 — PRICING
   ═══════════════════════════════════════════════════════════════════ */

function StepPricing({
  onContinue,
  onBack,
}: {
  onContinue: () => void;
  onBack: () => void;
}) {
  const [pricingType, setPricingType] = useState("hourly");
  const [enableThreshold, setEnableThreshold] = useState(true);

  const pricingOptions = [
    {
      key: "hourly",
      icon: Clock,
      title: "Hourly Rate",
      desc: "Charge customers based on how long they play",
    },
    {
      key: "flat",
      icon: CreditCard,
      title: "Flat Cover Fee",
      desc: "One-time fee per person, unlimited play time",
    },
    {
      key: "hybrid",
      icon: Zap,
      title: "Hybrid",
      desc: "Combine cover fee with hourly rate",
    },
  ];

  return (
    <div className="px-7 py-6 flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Pricing Model</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Choose how you want to charge customers for table reservations
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Pricing Type */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3">Pricing Type</h3>
          <div className="flex flex-col gap-3 mb-6">
            {pricingOptions.map((opt) => {
              const Icon = opt.icon;
              const active = pricingType === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setPricingType(opt.key)}
                  className={`flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                    active
                      ? "border-teal-500 bg-teal-50/60"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      active ? "bg-teal-600 text-white" : "bg-teal-50 text-teal-600"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                      {opt.title}
                      {active && <Check size={14} className="text-teal-600" />}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-tight">
                      {opt.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-4">
            <Input label="Hourly Rate" placeholder="$ 8.00" />
            <p className="text-[11px] text-gray-400 -mt-2">
              Amount charged per hour of play time
            </p>

            {/* Threshold checkbox */}
            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <button
                onClick={() => setEnableThreshold((v) => !v)}
                className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
                  enableThreshold
                    ? "bg-teal-600 border-teal-600"
                    : "border-gray-300"
                }`}
              >
                {enableThreshold && <Check size={13} className="text-white" />}
              </button>
              <span className="text-sm font-medium text-gray-800">
                Enable spending threshold
              </span>
            </label>

            {enableThreshold && (
              <>
                <Input label="Minimum Spend Amount" placeholder="$ 15.00" />
                <div className="bg-[#eef2ff] border border-blue-200 rounded-lg p-3 flex gap-2">
                  <span className="text-blue-500 shrink-0 font-bold border border-blue-500 rounded-full w-4 h-4 flex items-center justify-center text-[10px] mt-0.5">i</span>
                  <p className="text-xs text-blue-800 leading-snug">
                    If customers spend{" "}
                    <span className="font-bold">$15.00</span> or more on
                    food/drinks, the table fee will be waived automatically.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Customer Preview */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            Customer Preview
          </h3>
          <div className="border border-gray-200 rounded-xl p-5 shadow-sm bg-white">
            <p className="text-base font-bold text-gray-900">Table Pricing</p>
            <p className="text-sm text-gray-500 mb-4">
              Per hour of play time
            </p>
            <hr className="mb-4 border-gray-100" />
            <p className="text-2xl font-black text-gray-900 mb-4">
              $8.00<span className="text-sm font-normal text-gray-500">/hour</span>
            </p>
            <div className="flex flex-col gap-2 text-sm text-gray-600">
              <span>✓ 1 hour: $8.00</span>
              <span>✓ 2 hours: $16.00</span>
              <span>✓ 3 hours: $24.00</span>
              <span className="text-teal-600 font-medium">
                ✓ Free with $15.00+ purchase
              </span>
            </div>
          </div>
          <p className="text-[11px] text-gray-500 mt-4 leading-snug p-3 bg-warm-50 border border-warm-100 rounded-lg">
            This is how your pricing will appear to customers when they make a reservation.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex gap-3 mt-4">
        <Button variant="outline" fullWidth onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" fullWidth onClick={onContinue}>
          Continue
        </Button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STEP 7 — SUCCESS
   ═══════════════════════════════════════════════════════════════════ */

function StepSuccess({
  onFinish,
}: {
  onFinish: () => void;
}) {
  return (
    <div className="px-7 py-8 flex flex-col gap-6 items-center">
      <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mb-1">
        <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center">
          <Check size={24} className="text-white" strokeWidth={3} />
        </div>
      </div>
      
      <div className="text-center w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h2>
        <p className="text-sm text-gray-500">
          Your business account is ready to start accepting reservations
        </p>
      </div>

      <div className="w-full bg-warm-50 border border-warm-200 rounded-xl p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-4">What you've completed:</h3>
        <ul className="flex flex-col gap-3">
          {[
            "Business profile and contact information",
            "Table configuration and seating capacity",
            "Operating hours and schedule",
            "Game Library",
            "Menu Setup",
            "Pricing Model"
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-2.5 text-sm text-gray-600">
              <div className="w-4 h-4 rounded-full border border-teal-500 flex items-center justify-center shrink-0">
                <Check size={10} className="text-teal-600" strokeWidth={3} />
              </div>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="w-full border border-gray-200 rounded-xl p-6">
        <h3 className="text-sm font-bold text-gray-900 mb-5">What's next?</h3>
        <div className="flex flex-col gap-5">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
              <Calendar size={20} className="text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Start accepting reservations</p>
              <p className="text-xs text-gray-500 mt-0.5">Your customers can now book tables at your café</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
              <Users size={20} className="text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Invite your team</p>
              <p className="text-xs text-gray-500 mt-0.5">Add staff members to help manage reservations</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
              <Settings size={20} className="text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Customize your settings</p>
              <p className="text-xs text-gray-500 mt-0.5">Fine-tune reservation rules, notifications, and more</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mt-2">
        <Button variant="primary" fullWidth onClick={onFinish} className="py-3.5 text-[15px]">
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN WIZARD MODAL
   ═══════════════════════════════════════════════════════════════════ */

interface CafeSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CafeSetupWizard({
  isOpen,
  onClose,
}: CafeSetupWizardProps) {
  const [step, setStep] = useState<WizardStep>("business-info");

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const { stepNum, total } = STEP_MAP[step];

  const FLOW: WizardStep[] = [
    "business-info",
    "tables",
    "hours",
    "games",
    "menu",
    "pricing",
    "success",
  ];

  const goNext = () => {
    const idx = FLOW.indexOf(step);
    if (idx < FLOW.length - 1) setStep(FLOW[idx + 1]);
    else onClose(); // finished
  };

  const goBack = () => {
    const idx = FLOW.indexOf(step);
    if (idx > 0) setStep(FLOW[idx - 1]);
    else onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-[700px] bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>

        {/* Header — same style as AuthModal but with custom subtitle */}
        <div className="flex items-center gap-3 px-7 py-8 pt-6 justify-center bg-white rounded-t-2xl">
          <div className="flex items-center gap-3 border-b border-teal-500 w-full px-0 py-4 -mx-7 -mb-4">
            <img
              src={gatoreLogo}
              alt="Gatore"
              className="w-23.25 h-12 object-contain shrink-0"
            />
            <div>
              <p className="text-lg font-extrabold tracking-widest text-teal-800 uppercase leading-tight">
                GATORE
              </p>
              <p className="text-sm text-neutral-700 leading-snug">
                {step === "success" ? "Your café's home base" : "Set up your café in minutes"}
              </p>
            </div>
          </div>
        </div>

        {/* Step progress */}
        {step !== "success" && <StepProgress current={stepNum} total={total} />}

        {/* Step content — scrollable */}
        <div className="flex-1 overflow-y-auto">
          {step === "business-info" && (
            <StepBusinessInfo onContinue={goNext} onBack={goBack} />
          )}
          {step === "tables" && (
            <StepTables onContinue={goNext} onBack={goBack} />
          )}
          {step === "hours" && (
            <StepHours onContinue={goNext} onBack={goBack} />
          )}
          {step === "games" && (
            <StepGames onContinue={goNext} onBack={goBack} />
          )}
          {step === "menu" && (
            <StepMenu onFinish={goNext} onBack={goBack} />
          )}
          {step === "pricing" && (
            <StepPricing onContinue={goNext} onBack={goBack} />
          )}
          {step === "success" && (
            <StepSuccess onFinish={onClose} />
          )}
        </div>

        {/* Powered by footer */}
        <div className="py-3 text-center text-xs text-gray-400 border-t border-gray-100 shrink-0">
          Powered by{" "}
          <span className="font-bold text-teal-600 tracking-wide">GATORE</span>
        </div>
      </div>
    </div>
  );
}
