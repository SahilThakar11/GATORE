import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  ChevronDown,
  Plus,
  Trash2,
  Check,
  Globe,
  Upload,
  PlusCircle,
  ClipboardList,
  ChevronLeft,
  Clock,
  Zap,
  CreditCard,
  Calendar,
  Users,
  Settings,
  Loader2,
  ImagePlus,
  Search,
} from "lucide-react";

function LightbulbIcon({ size = 20, className = "" }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
        <path d="M17.252 12.49c-.284 2.365-1.833 3.31-2.502 3.996c-.67.688-.55.825-.505 1.834a.916.916 0 0 1-.916.971h-2.658a.92.92 0 0 1-.917-.971c0-.99.092-1.22-.504-1.834c-.76-.76-2.548-1.833-2.548-4.784a5.307 5.307 0 1 1 10.55.788"/>
        <path d="M10.46 19.236v1.512c0 .413.23.752.513.752h2.053c.285 0 .514-.34.514-.752v-1.512m-2.32-10.54a2.227 2.227 0 0 0-2.226 2.227m10.338.981h1.834m-3.68-6.012l1.301-1.301M18.486 17l1.301 1.3M12 2.377V3.86m-6.76.73l1.292 1.302M4.24 18.3L5.532 17m-.864-5.096H2.835"/>
      </g>
    </svg>
  );
}
import { StepProgress } from "../auth/StepProgress";
import { AlertBanner } from "../ui/AlertBanner";
import { Dropdown } from "../ui/Dropdown";
import { Input } from "../ui/Input";
import { PrimaryButton } from "../ui/PrimaryButton";
import { SecondaryButton } from "../ui/SecondaryButton";
import { TextButton } from "../ui/TextButton";
import { DifficultyDots } from "../searchGames/DifficultyDots";
import { timeStringToMinutes } from "../../hooks/useBusinessSettings";
import { useBGGSearch, type BGGGame } from "../../hooks/useBGG";
import { useBusinessSettings } from "../../hooks/useBusinessSettings";
import gatoreLogo from "/logo.png";
import {
  validateEmail,
  validatePhone,
  validateUrl,
  validatePostalCode,
  validateRequired,
  validatePositiveNumber,
} from "../../utils/validations";

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
  "business-info": { stepNum: 1, total: 6 },
  tables:          { stepNum: 2, total: 6 },
  hours:           { stepNum: 3, total: 6 },
  games:           { stepNum: 4, total: 6 },
  menu:            { stepNum: 5, total: 6 },
  pricing:         { stepNum: 6, total: 6 },
  success:         { stepNum: 6, total: 6 },
};

const DAYS = [
  "Monday", "Tuesday", "Wednesday", "Thursday",
  "Friday", "Saturday", "Sunday",
];

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
  filled,
  emptyBg = "bg-warm-50",
}: {
  label?: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  filled?: boolean;
  emptyBg?: string;
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs sm:text-sm font-medium text-neutral-800">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none px-4 py-3 border border-warm-300 rounded-lg text-sm sm:text-base text-neutral-700 outline-none transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer ${filled ? "bg-teal-50" : emptyBg}`}
        >
          <option value="">Select…</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 pointer-events-none"
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   STEP 1 — BUSINESS INFO
   ═══════════════════════════════════════════════════════════════════ */

const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2 MB
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

function StepBusinessInfo({
  onContinue,
  onBack,
  profileData,
  setProfileData,
  logoBase64,
  setLogoBase64,
  businessName,
}: {
  onContinue: () => void;
  onBack: () => void;
  profileData: Record<string, string>;
  setProfileData: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  logoBase64: string;
  setLogoBase64: React.Dispatch<React.SetStateAction<string>>;
  businessName: string;
}) {
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: null }));
  };

  const handleLogoSelect = (file: File) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, logo: "Please upload a PNG, JPG, WebP, or SVG image." }));
      return;
    }
    if (file.size > MAX_LOGO_SIZE) {
      setErrors((prev) => ({ ...prev, logo: "Image must be under 2 MB." }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogoBase64(reader.result as string);
      setErrors((prev) => ({ ...prev, logo: null }));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleLogoSelect(file);
  };

  const handleContinue = () => {
    const newErrors: Record<string, string | null> = {
      name: validateRequired(profileData.name),
      logo: logoBase64 ? null : "A café logo is required.",
      contactEmail: validateEmail(profileData.contactEmail),
      contactName: validateRequired(profileData.contactName),
      website: validateUrl(profileData.website),
      phone: validatePhone(profileData.phone),
      address: validateRequired(profileData.address),
      city: validateRequired(profileData.city),
      province: validateRequired(profileData.province),
      postalCode: validatePostalCode(profileData.postalCode),
    };
    setErrors(newErrors);
    const hasError = Object.values(newErrors).some((e) => e !== null);
    if (!hasError) onContinue();
  };

  return (
    <div className="px-7 py-6 flex flex-col gap-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-800">
          Set up your business account for{" "}
          <span className="text-neutral-800">{businessName}</span>
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
          Let's get your café ready for reservations
        </p>
      </div>

      {/* Logo Upload */}
      <div>
        <label className="block text-sm font-medium text-neutral-800 mb-2">
          Café Logo <span className="text-red-500">*</span>
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className={`relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all ${
            errors.logo
              ? "border-red-300 bg-red-50/30"
              : logoBase64
                ? "border-teal-300 bg-teal-50/30 hover:border-teal-500 hover:bg-teal-50/60"
                : "border-warm-300 bg-warm-50 hover:border-teal-600 hover:bg-teal-50"
          }`}
        >
          {logoBase64 ? (
            <div className="flex items-center gap-4">
              <img
                src={logoBase64}
                alt="Café logo preview"
                className="w-16 h-16 rounded-xl object-cover border border-warm-200"
              />
              <div className="text-left">
                <p className="text-sm font-medium text-neutral-800">Logo uploaded</p>
                <p className="text-xs text-teal-700 mt-0.5">Click or drag to replace</p>
              </div>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-warm-200 flex items-center justify-center mb-2">
                <ImagePlus size={22} className="text-neutral-600" />
              </div>
              <p className="text-sm font-medium text-neutral-700">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-neutral-600 mt-0.5">
                PNG, JPG, WebP, or SVG (max 2 MB)
              </p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleLogoSelect(file);
              e.target.value = "";
            }}
          />
        </div>
        {errors.logo && (
          <p role="alert" className="text-xs text-red-500 mt-1.5">{errors.logo}</p>
        )}

        {/* Generic logo picker */}
        <div className="mt-3">
          <p className="text-xs text-neutral-600 mb-2">Or pick a generic logo:</p>
          <div className="flex gap-2 flex-wrap">
            {[
              "#0f766e", "#0369a1", "#7c3aed", "#b45309", "#be123c", "#15803d",
            ].map((color) => {
              const initial = (profileData.name?.[0] ?? "?").toUpperCase();
              const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="${color}"/><text x="32" y="46" font-family="system-ui,-apple-system,sans-serif" font-size="34" font-weight="700" text-anchor="middle" fill="white">${initial}</text></svg>`;
              const dataUrl = `data:image/svg+xml;base64,${btoa(svg)}`;
              const isSelected = logoBase64 === dataUrl;
              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    setLogoBase64(dataUrl);
                    setErrors((prev) => ({ ...prev, logo: null }));
                  }}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold border-2 transition-all cursor-pointer ${
                    isSelected ? "border-neutral-800 scale-110" : "border-transparent hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Generic logo with colour ${color}`}
                >
                  {initial}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <Input
        label={<>Café Name <span className="text-red-500">*</span></>}
        placeholder="e.g. The Board Room Café"
        value={profileData.name || ""}
        onChange={update("name")}
        error={errors.name ?? undefined}
      />
      <Input
        label={<>Email Address <span className="text-red-500">*</span></>}
        type="email"
        placeholder="contact@yourbusiness.com"
        value={profileData.contactEmail || ""}
        onChange={update("contactEmail")}
        error={errors.contactEmail ?? undefined}
      />
      <Input
        label={<>Contact Name <span className="text-red-500">*</span></>}
        placeholder="Your name"
        value={profileData.contactName || ""}
        onChange={update("contactName")}
        error={errors.contactName ?? undefined}
      />
      <Input
        label="Business Website"
        placeholder="https://www.yourbusiness.com"
        rightIcon={<Globe size={16} />}
        value={profileData.website || ""}
        onChange={update("website")}
        error={errors.website ?? undefined}
      />

      <div className="grid grid-cols-2 gap-4">
        <SelectField
          label="Business Type"
          options={["Board Game Café", "Restaurant", "Bar", "Lounge", "Other"]}
          value={profileData.businessType || ""}
          onChange={(v) => setProfileData((prev) => ({ ...prev, businessType: v }))}
        />
        <Input
          label="Phone Number"
          type="tel"
          placeholder="(555) 123-4567"
          value={profileData.phone || ""}
          onChange={update("phone")}
          error={errors.phone ?? undefined}
        />
      </div>

      <h3 className="text-base font-bold text-neutral-800 mt-2">
        Business Address
      </h3>
      <Input
        label={<>Street Address <span className="text-red-500">*</span></>}
        placeholder="123 Main Street"
        value={profileData.address || ""}
        onChange={update("address")}
        error={errors.address ?? undefined}
      />
      <div className="grid grid-cols-3 gap-4">
        <Input label={<>City <span className="text-red-500">*</span></>} placeholder="City" value={profileData.city || ""} onChange={update("city")} error={errors.city ?? undefined} />
        <Input label={<>Province <span className="text-red-500">*</span></>} placeholder="Province" value={profileData.province || ""} onChange={update("province")} error={errors.province ?? undefined} />
        <Input label="Postal Code" placeholder="Postal Code" value={profileData.postalCode || ""} onChange={update("postalCode")} error={errors.postalCode ?? undefined} />
      </div>

      <div className="flex gap-3 bg-warm-50 px-7 py-4 border-t border-warm-200 -mx-7 -mb-6 mt-2">
        <div className="flex-1 [&>button]:w-full">
          <SecondaryButton label="Back" onClick={onBack} leftIcon={<ChevronLeft size={16} aria-hidden="true" />} />
        </div>
        <div className="flex-1 [&>button]:w-full">
          <PrimaryButton label="Continue" onClick={handleContinue} />
        </div>
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
  tables,
  setTables,
}: {
  onContinue: () => void;
  onBack: () => void;
  tables: TableEntry[];
  setTables: React.Dispatch<React.SetStateAction<TableEntry[]>>;
}) {
  const [tableErrors, setTableErrors] = useState<Record<string, Record<string, string | null>>>({});

  const updateTable = (id: string, patch: Partial<TableEntry>) => {
    setTables((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)));
    // Clear errors for the field that changed
    const key = Object.keys(patch)[0];
    setTableErrors((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || {}), [key]: null },
    }));
  };

  const removeTable = (id: string) =>
    setTables((prev) => prev.filter((t) => t.id !== id));

  const addTable = () => {
    const nextNum = tables.length + 1;
    setTables((prev) => [
      ...prev,
      { id: Date.now().toString(), name: `Table ${nextNum}`, capacity: "", type: "" },
    ]);
  };

  const handleContinue = () => {
    const newErrors: Record<string, Record<string, string | null>> = {};
    let hasError = false;
    tables.forEach((t) => {
      const errs: Record<string, string | null> = {
        name: validateRequired(t.name),
        capacity: t.capacity ? null : "Select a capacity.",
        type: t.type ? null : "Select a table type.",
      };
      newErrors[t.id] = errs;
      if (Object.values(errs).some((e) => e !== null)) hasError = true;
    });
    setTableErrors(newErrors);
    if (!hasError) onContinue();
  };

  return (
    <div className="px-7 py-6 flex flex-col gap-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-800">Tables & Seating</h2>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
          Configure your tables for customer reservations
        </p>
      </div>

      {/* Table cards */}
      <div className="flex flex-col gap-4">
        {tables.map((t) => {
          const errs = tableErrors[t.id] || {};
          return (
            <div
              key={t.id}
              className={`border rounded-xl p-5 bg-warm-50 ${
                Object.values(errs).some((e) => e) ? "border-red-300" : "border-warm-200"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-neutral-800">{t.name}</h4>
                <button
                  onClick={() => removeTable(t.id)}
                  className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3">
                <Input
                  label="Table Name"
                  placeholder={t.name}
                  value={t.name}
                  onChange={(e) => updateTable(t.id, { name: e.target.value })}
                  error={errs.name ?? undefined}
                  emptyBg="bg-white"
                />
                <div className="grid grid-cols-2 sm:contents gap-3">
                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-medium text-neutral-800">Capacity</label>
                    <Dropdown
                      trigger="label"
                      triggerLabel={t.capacity ? `${t.capacity} seats` : "Select…"}
                      isPlaceholder={!t.capacity}
                      fullWidth
                      onBackground="warm"
                      items={["2", "4", "6", "8", "10", "12"].map((opt) => ({
                        label: `${opt} seats`,
                        onClick: () => updateTable(t.id, { capacity: opt }),
                      }))}
                    />
                    {errs.capacity && <p role="alert" className="text-xs text-red-500">{errs.capacity}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="block text-xs sm:text-sm font-medium text-neutral-800">Table Type</label>
                    <Dropdown
                      trigger="label"
                      triggerLabel={t.type || "Select…"}
                      isPlaceholder={!t.type}
                      fullWidth
                      onBackground="warm"
                      items={["Round", "Square", "Booth", "High-Top"].map((opt) => ({
                        label: opt,
                        onClick: () => updateTable(t.id, { type: opt }),
                      }))}
                    />
                    {errs.type && <p role="alert" className="text-xs text-red-500">{errs.type}</p>}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add another table */}
      <div className="[&>button]:w-full">
        <SecondaryButton
          label="Add another table"
          onClick={addTable}
          leftIcon={<Plus size={15} aria-hidden="true" />}
        />
      </div>

      <AlertBanner
        variant="warning"
        icon={LightbulbIcon as any}
        title="Tip"
        description="You can always add, remove, or modify tables later from your dashboard settings."
      />

      {/* Footer */}
      <div className="flex gap-3 bg-warm-50 px-7 py-4 border-t border-warm-200 -mx-7 -mb-6 mt-1">
        <div className="flex-1 [&>button]:w-full">
          <SecondaryButton label="Back" onClick={onBack} leftIcon={<ChevronLeft size={16} aria-hidden="true" />} />
        </div>
        <div className="flex-1 [&>button]:w-full">
          <PrimaryButton label="Continue" onClick={handleContinue} />
        </div>
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
  hours,
  setHours,
}: {
  onContinue: () => void;
  onBack: () => void;
  hours: Record<string, DayHours>;
  setHours: React.Dispatch<React.SetStateAction<Record<string, DayHours>>>;
}) {
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
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-800">Operating Hours</h2>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
          Set your business hours for each day of the week
        </p>
      </div>

      {/* Apply to all */}
      <div className="flex items-center justify-between border border-warm-200 rounded-xl bg-white px-4 py-3">
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
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 border border-warm-200 rounded-xl px-3 py-2.5 bg-warm-50"
            >
              {/* Checkbox + day name */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateDay(day, { enabled: !h.enabled })}
                  className={`w-5 h-5 rounded flex items-center justify-center border-2 shrink-0 cursor-pointer transition-colors ${
                    h.enabled
                      ? "bg-teal-600 border-teal-600"
                      : "border-warm-300"
                  }`}
                >
                  {h.enabled && <Check size={13} className="text-white" strokeWidth={3} />}
                </button>
                <span className="text-sm font-medium text-neutral-700 sm:w-24">
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
                  className="flex-1 px-3 py-3 border border-warm-300 rounded-lg text-sm text-neutral-700 outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-40 bg-white cursor-pointer"
                />
                <span className="text-xs text-neutral-600 shrink-0">to</span>
                <input
                  type="time"
                  value={toInputTime(h.close)}
                  onChange={(e) => e.target.value && updateDay(day, { close: fromInputTime(e.target.value) })}
                  disabled={!h.enabled}
                  className="flex-1 px-3 py-3 border border-warm-300 rounded-lg text-sm text-neutral-700 outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-40 bg-white cursor-pointer"
                />
              </div>
            </div>
          );
        })}
      </div>

      <AlertBanner
        variant="info"
        title="Note"
        description="These hours will be displayed to customers when they book reservations. You can adjust them anytime from your settings."
      />

      {/* Footer */}
      <div className="flex gap-3 bg-warm-50 px-7 py-4 border-t border-warm-200 -mx-7 -mb-6 mt-1">
        <div className="flex-1 [&>button]:w-full">
          <SecondaryButton label="Back" onClick={onBack} leftIcon={<ChevronLeft size={16} aria-hidden="true" />} />
        </div>
        <div className="flex-1 [&>button]:w-full">
          <PrimaryButton label="Continue" onClick={onContinue} />
        </div>
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
  selectedGames,
  setSelectedGames,
}: {
  onContinue: () => void;
  onBack: () => void;
  selectedGames: BGGGame[];
  setSelectedGames: React.Dispatch<React.SetStateAction<BGGGame[]>>;
}) {
  const { games, loading, loadingMore, hasMore, search, loadMore, clear } = useBGGSearch();
  const [query, setQuery] = useState("");
  const [chipsOpen, setChipsOpen] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectedBggIds = new Set(selectedGames.map((g) => String(g.id)));

  const handleQueryChange = useCallback((val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) { clear(); return; }
    debounceRef.current = setTimeout(() => search(val.trim()), 500);
  }, [search, clear]);

  const toggleGame = (game: BGGGame) => {
    const id = String(game.id);
    setSelectedGames((prev) =>
      prev.some((g) => String(g.id) === id)
        ? prev.filter((g) => String(g.id) !== id)
        : [...prev, game]
    );
  };

  return (
    <div className="px-7 py-6 flex flex-col gap-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-800">Game Library</h2>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
          Search BoardGameGeek and add the games your café offers (optional)
        </p>
      </div>

      {/* Search bar */}
      <Input
        type="text"
        value={query}
        onChange={(e) => handleQueryChange(e.target.value)}
        placeholder="Search for a game… (e.g. Catan, Ticket to Ride)"
        leftIcon={<Search size={15} aria-hidden="true" />}
      />

      {/* Selected games chips */}
      {selectedGames.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="-ml-3">
            <TextButton
              size="xs"
              label={`${selectedGames.length} game${selectedGames.length !== 1 ? "s" : ""} selected`}
              onClick={() => setChipsOpen((v) => !v)}
              aria-label={chipsOpen ? "Collapse selected games" : "Expand selected games"}
              rightIcon={
                <ChevronDown
                  size={13}
                  style={{ transition: "transform 200ms", transform: chipsOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
                />
              }
            />
          </div>
          {chipsOpen && (
            <div className="flex flex-wrap gap-2" role="list" aria-label="Selected games">
              {selectedGames.map((g) => (
                <span key={g.id} role="listitem" className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-2.5 py-1.5 rounded-full">
                  {g.name}
                  <button onClick={() => toggleGame(g)} aria-label={`Remove ${g.name}`} className="hover:text-red-500 cursor-pointer"><X size={11} /></button>
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Results */}
      {loading && (
        <div className="space-y-3" role="status" aria-label="Loading games">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-warm-100 rounded-xl animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
          ))}
        </div>
      )}

      {!loading && games.length > 0 && (
        <>
          <div className="flex flex-col gap-2">
            <p className="text-xs text-neutral-500" aria-live="polite">
              {hasMore ? `Showing ${games.length} results` : `Showing all ${games.length} result${games.length !== 1 ? "s" : ""}`}
            </p>
          <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
            {games.map((game) => {
              const selected = selectedBggIds.has(String(game.id));
              return (
                <button
                  key={game.id}
                  onClick={() => toggleGame(game)}
                  aria-pressed={selected}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all duration-150 text-left cursor-pointer ${
                    selected
                      ? "border-teal-500 bg-warm-100 shadow-sm"
                      : "border-warm-300 bg-warm-50 hover:border-teal-500 hover:shadow-sm"
                  }`}
                >
                  <div className="w-22 h-22 sm:w-24 sm:h-24 rounded-lg overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
                    {game.image
                      ? <img src={game.image} alt={game.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs" aria-hidden="true">No image</div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm sm:text-base font-bold text-gray-900 leading-snug mb-1.5">{game.name}</p>
                    <DifficultyDots difficulty={game.difficulty} dots={game.weightDots} textSizeClass="text-xs" />
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Users size={13} className="sm:hidden" aria-hidden="true" />
                        <Users size={15} className="hidden sm:block" aria-hidden="true" />
                        <span className="text-xs lg:text-sm">{game.players} players</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600">
                        <Clock size={13} className="sm:hidden" aria-hidden="true" />
                        <Clock size={15} className="hidden sm:block" aria-hidden="true" />
                        <span className="text-xs lg:text-sm">{game.duration}</span>
                      </div>
                    </div>
                    {game.categories.length > 0 && (
                      <div className="flex gap-1.5 mt-1.5 flex-wrap">
                        {game.categories.slice(0, 2).map((cat) => (
                          <span key={cat} className="text-xs bg-warm-200 text-warm-700 px-2 py-0.5 rounded-md font-medium">
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${selected ? "bg-teal-600" : "border-2 border-warm-300"}`}>
                    {selected && <Check size={12} className="text-white" strokeWidth={3} />}
                  </div>
                </button>
              );
            })}
          </div>
          {hasMore && (
            <div className="[&>button]:w-full">
              <SecondaryButton
                label="Load more"
                onClick={loadMore}
                disabled={loadingMore}
                isLoading={loadingMore}
                size="small"
              />
            </div>
          )}
          </div>
        </>
      )}

      {!loading && !query && games.length === 0 && (
        <p className="text-xs text-neutral-600 text-center py-2">Start typing to search the BoardGameGeek database</p>
      )}

      {/* Footer */}
      <div className="flex gap-3 bg-warm-50 px-7 py-4 border-t border-warm-200 -mx-7 -mb-6 mt-1">
        <div className="flex-1 [&>button]:w-full">
          <SecondaryButton label="Back" onClick={onBack} leftIcon={<ChevronLeft size={16} aria-hidden="true" />} />
        </div>
        <div className="flex-1 [&>button]:w-full">
          <PrimaryButton
            label={selectedGames.length > 0 ? "Continue" : "Skip for Now"}
            onClick={onContinue}
          />
        </div>
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
      iconBg: "bg-teal-50 text-teal-600 border border-teal-200",
      iconBgHover: "group-hover:bg-teal-100 group-hover:text-teal-700 group-hover:border-teal-300",
      title: "Upload PDF",
      desc: "Upload an existing menu PDF",
    },
    {
      icon: PlusCircle,
      iconBg: "bg-amber-50 text-amber-600 border border-amber-200",
      iconBgHover: "group-hover:bg-amber-100 group-hover:text-amber-700 group-hover:border-amber-300",
      title: "Add Items Manually",
      desc: "Create your menu item by item",
    },
    {
      icon: ClipboardList,
      iconBg: "bg-purple-50 text-purple-600 border border-purple-200",
      iconBgHover: "group-hover:bg-purple-100 group-hover:text-purple-700 group-hover:border-purple-300",
      title: "Start with Template",
      desc: "Choose from pre-built menu templates",
    },
  ];

  return (
    <div className="px-7 py-6 flex flex-col gap-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-800">Menu Setup</h2>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
          Add your menu so customers can browse while making reservations{" "}
          <span className="text-neutral-400">(optional)</span>
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-bold text-neutral-800 mb-1">
          How would you like to add your menu?
        </h3>
        {menuOptions.map((opt) => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.title}
              aria-label={opt.title}
              className="group flex items-center gap-4 bg-warm-50 border border-warm-300 rounded-xl px-4 py-4 text-left hover:bg-warm-100 hover:border-warm-400 transition-all cursor-pointer"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors ${opt.iconBg} ${opt.iconBgHover}`}
              >
                <Icon size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-800">{opt.title}</p>
                <p className="text-xs text-neutral-600 mt-0.5 leading-snug">
                  {opt.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex gap-3 bg-warm-50 px-7 py-4 border-t border-warm-200 -mx-7 -mb-6 mt-1">
        <div className="flex-1 [&>button]:w-full">
          <SecondaryButton label="Back" onClick={onBack} leftIcon={<ChevronLeft size={16} aria-hidden="true" />} />
        </div>
        <div className="flex-1 [&>button]:w-full">
          <PrimaryButton label="Skip for Now" onClick={onFinish} />
        </div>
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
  pricingData,
  setPricingData,
  saveError,
}: {
  onContinue: () => void;
  onBack: () => void;
  pricingData: { pricingType: string; hourlyRate: string; coverFee: string; enableThreshold: boolean; minSpend: string };
  setPricingData: React.Dispatch<React.SetStateAction<{ pricingType: string; hourlyRate: string; coverFee: string; enableThreshold: boolean; minSpend: string }>>;
  saveError?: string | null;
}) {
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  const pricingType = pricingData.pricingType;
  const setPricingType = (v: string) => {
    setPricingData((p) => ({ ...p, pricingType: v }));
    setErrors({});
  };
  const enableThreshold = pricingData.enableThreshold;
  const setEnableThreshold = (v: boolean | ((prev: boolean) => boolean)) =>
    setPricingData((p) => ({ ...p, enableThreshold: typeof v === "function" ? v(p.enableThreshold) : v }));

  const handleContinue = () => {
    const newErrors: Record<string, string | null> = {};
    if (pricingType === "hourly" || pricingType === "hybrid") {
      newErrors.hourlyRate = validatePositiveNumber(pricingData.hourlyRate, "Hourly Rate");
    }
    if (pricingType === "flat" || pricingType === "hybrid") {
      newErrors.coverFee = validatePositiveNumber(pricingData.coverFee, "Cover Fee");
    }
    if (enableThreshold) {
      newErrors.minSpend = validatePositiveNumber(pricingData.minSpend, "Minimum Spend");
    }
    setErrors(newErrors);
    if (Object.values(newErrors).every((e) => e === null)) onContinue();
  };

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
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-800">Pricing Model</h2>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
          Choose how you want to charge customers for table reservations
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Pricing Type */}
        <div>
          <h3 className="text-sm font-bold text-neutral-800 mb-3">Pricing Type</h3>
          <div className="flex flex-col gap-3 mb-6">
            {pricingOptions.map((opt) => {
              const Icon = opt.icon;
              const active = pricingType === opt.key;
              return (
                <button
                  key={opt.key}
                  onClick={() => setPricingType(opt.key)}
                  aria-pressed={active}
                  className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                    active
                      ? "border-teal-500 bg-warm-100 shadow-sm"
                      : "border-warm-300 bg-warm-50 hover:border-warm-400 hover:bg-warm-100"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                      active
                        ? "bg-teal-700 text-white border-teal-600"
                        : "bg-teal-50 text-teal-700 border-teal-200"
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-neutral-800 flex items-center gap-1.5">
                      {opt.title}
                      {active && <Check size={14} className="text-teal-700" strokeWidth={3} />}
                    </p>
                    <p className="text-xs text-neutral-600 mt-0.5 leading-tight">
                      {opt.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex flex-col gap-4">
            {(pricingType === "flat" || pricingType === "hybrid") && (
              <>
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-medium text-neutral-800">Cover Fee (per person)</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-neutral-500">$</span>
                    <div className="flex-1">
                      <Input
                        placeholder="5.00"
                        value={pricingData.coverFee}
                        onChange={(e) => {
                          setPricingData((p) => ({ ...p, coverFee: e.target.value }));
                          setErrors((prev) => ({ ...prev, coverFee: null }));
                        }}
                        error={errors.coverFee ?? undefined}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-neutral-600 -mt-2">
                  One-time fee charged per person at the time of reservation
                </p>
              </>
            )}
            {(pricingType === "hourly" || pricingType === "hybrid") && (
              <>
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-medium text-neutral-800">Hourly Rate</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-neutral-500">$</span>
                    <div className="flex-1">
                      <Input
                        placeholder="8.00"
                        value={pricingData.hourlyRate}
                        onChange={(e) => {
                          setPricingData((p) => ({ ...p, hourlyRate: e.target.value }));
                          setErrors((prev) => ({ ...prev, hourlyRate: null }));
                        }}
                        error={errors.hourlyRate ?? undefined}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-neutral-600 -mt-2">
                  Amount charged per hour of play time
                </p>
              </>
            )}

            {/* Threshold checkbox */}
            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <button
                onClick={() => setEnableThreshold((v) => !v)}
                aria-pressed={enableThreshold}
                className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors shrink-0 ${
                  enableThreshold
                    ? "bg-teal-600 border-teal-600"
                    : "border-warm-300"
                }`}
              >
                {enableThreshold && <Check size={13} className="text-white" strokeWidth={3} />}
              </button>
              <span className="text-sm font-medium text-neutral-800">
                Enable spending threshold
              </span>
            </label>

            {enableThreshold && (
              <>
                <div className="space-y-2">
                  <label className="block text-xs sm:text-sm font-medium text-neutral-800">Minimum Spend Amount</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-neutral-500">$</span>
                    <div className="flex-1">
                      <Input
                        placeholder="15.00"
                        value={pricingData.minSpend}
                        onChange={(e) => {
                          setPricingData((p) => ({ ...p, minSpend: e.target.value }));
                          setErrors((prev) => ({ ...prev, minSpend: null }));
                        }}
                        error={errors.minSpend ?? undefined}
                      />
                    </div>
                  </div>
                </div>
                <AlertBanner
                  variant="info"
                  title={`If customers spend $${parseFloat(pricingData.minSpend) || 0} or more on food/drinks, the table fee will be waived automatically.`}
                />
              </>
            )}
          </div>
        </div>

        {/* Customer Preview */}
        <div>
          <h3 className="text-sm font-bold text-neutral-800 mb-3">
            Customer Preview
          </h3>
          <div className="border border-warm-300 rounded-xl p-5 shadow-sm bg-white">
            <p className="text-base font-bold text-neutral-800">Table Pricing</p>
            <p className="text-sm text-neutral-600 mb-4">
              {pricingType === "flat" ? "Per person, unlimited play time" : pricingType === "hybrid" ? "Cover fee + hourly rate" : "Per hour of play time"}
            </p>
            <hr className="mb-4 border-warm-200" />
            {pricingType === "flat" ? (
              <>
                <p className="text-2xl font-black text-neutral-800 mb-4">
                  ${parseFloat(pricingData.coverFee) || 0}<span className="text-sm font-normal text-neutral-600">/person</span>
                </p>
                <div className="flex flex-col gap-2 text-sm text-neutral-600">
                  <span className="flex items-center gap-1.5"><Check size={12} className="text-teal-700 shrink-0" strokeWidth={3} />One-time cover fee per person</span>
                  <span className="flex items-center gap-1.5"><Check size={12} className="text-teal-700 shrink-0" strokeWidth={3} />Unlimited play time included</span>
                  {enableThreshold && (
                    <span className="flex items-center gap-1.5 text-teal-700 font-medium">
                      <Check size={12} className="shrink-0" strokeWidth={3} />Waived with ${parseFloat(pricingData.minSpend) || 0}+ purchase
                    </span>
                  )}
                </div>
              </>
            ) : pricingType === "hybrid" ? (
              <>
                <p className="text-2xl font-black text-neutral-800 mb-4">
                  ${parseFloat(pricingData.coverFee) || 0}<span className="text-sm font-normal text-neutral-600">/person</span>
                  <span className="text-base font-normal text-neutral-500 ml-2">+ ${parseFloat(pricingData.hourlyRate) || 0}/hr</span>
                </p>
                <div className="flex flex-col gap-2 text-sm text-neutral-600">
                  <span className="flex items-center gap-1.5"><Check size={12} className="text-teal-700 shrink-0" strokeWidth={3} />Cover fee: ${(parseFloat(pricingData.coverFee) || 0).toFixed(2)} per person</span>
                  <span className="flex items-center gap-1.5"><Check size={12} className="text-teal-700 shrink-0" strokeWidth={3} />+ ${(parseFloat(pricingData.hourlyRate) || 0).toFixed(2)}/hour at the table</span>
                  {enableThreshold && (
                    <span className="flex items-center gap-1.5 text-teal-700 font-medium">
                      <Check size={12} className="shrink-0" strokeWidth={3} />Hourly waived with ${parseFloat(pricingData.minSpend) || 0}+ purchase
                    </span>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="text-2xl font-black text-neutral-800 mb-4">
                  ${parseFloat(pricingData.hourlyRate) || 0}<span className="text-sm font-normal text-neutral-600 ml-1">/hour</span>
                </p>
                <div className="flex flex-col gap-2 text-sm text-neutral-600">
                  <span className="flex items-center gap-1.5"><Check size={12} className="text-teal-700 shrink-0" strokeWidth={3} />1 hour: ${(parseFloat(pricingData.hourlyRate) || 0).toFixed(2)}</span>
                  <span className="flex items-center gap-1.5"><Check size={12} className="text-teal-700 shrink-0" strokeWidth={3} />2 hours: ${((parseFloat(pricingData.hourlyRate) || 0) * 2).toFixed(2)}</span>
                  <span className="flex items-center gap-1.5"><Check size={12} className="text-teal-700 shrink-0" strokeWidth={3} />3 hours: ${((parseFloat(pricingData.hourlyRate) || 0) * 3).toFixed(2)}</span>
                  {enableThreshold && (
                    <span className="flex items-center gap-1.5 text-teal-700 font-medium">
                      <Check size={12} className="shrink-0" strokeWidth={3} />Free with ${parseFloat(pricingData.minSpend) || 0}+ purchase
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="mt-3">
            <AlertBanner
              variant="info"
              title="This is how your pricing will appear to customers when they make a reservation."
            />
          </div>
        </div>
      </div>

      {saveError && (
        <AlertBanner variant="error" title="Setup failed" description={saveError} />
      )}

      {/* Footer */}
      <div className="flex gap-3 bg-warm-50 px-7 py-4 border-t border-warm-200 -mx-7 -mb-6 mt-1">
        <div className="flex-1 [&>button]:w-full">
          <SecondaryButton label="Back" onClick={onBack} leftIcon={<ChevronLeft size={16} aria-hidden="true" />} />
        </div>
        <div className="flex-1 [&>button]:w-full">
          <PrimaryButton label="Continue" onClick={handleContinue} />
        </div>
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
        <h2 className="text-2xl font-bold text-neutral-800 mb-2">You're all set!</h2>
        <p className="text-sm text-neutral-600">
          Your business account is ready to start accepting reservations
        </p>
      </div>

      <div className="w-full bg-warm-50 border border-warm-200 rounded-xl p-6">
        <h3 className="text-sm font-bold text-neutral-800 mb-4">What you've completed:</h3>
        <ul className="flex flex-col gap-3">
          {[
            "Business profile and contact information",
            "Table configuration and seating capacity",
            "Operating hours and schedule",
            "Game Library",
            "Menu Setup",
            "Pricing Model"
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-2.5 text-sm text-neutral-600">
              <div className="w-4 h-4 rounded-full border border-teal-500 flex items-center justify-center shrink-0">
                <Check size={10} className="text-teal-600" strokeWidth={3} />
              </div>
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div className="w-full border border-warm-200 rounded-xl p-6">
        <h3 className="text-sm font-bold text-neutral-800 mb-5">What's next?</h3>
        <div className="flex flex-col gap-5">
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
              <Calendar size={20} className="text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-800">Start accepting reservations</p>
              <p className="text-xs text-neutral-600 mt-0.5">Your customers can now book tables at your café</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
              <Users size={20} className="text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-800">Invite your team</p>
              <p className="text-xs text-neutral-600 mt-0.5">Add staff members to help manage reservations</p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
              <Settings size={20} className="text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-800">Customize your settings</p>
              <p className="text-xs text-neutral-600 mt-0.5">Fine-tune reservation rules, notifications, and more</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full mt-2 [&>button]:w-full">
        <PrimaryButton label="Go to Dashboard" onClick={onFinish} />
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
  onComplete?: (data: {
    profile?: Record<string, string>;
    tables?: { name: string; capacity: number; type: string }[];
    hours?: { dayOfWeek: string; openTime: number; closeTime: number; isClosed: boolean }[];
    pricing?: Record<string, any>;
    logoUrl?: string;
  }) => Promise<{ success: boolean }>;
  businessName?: string;
  initialProfile?: {
    contactEmail?: string | null;
    contactName?: string | null;
    phone?: string | null;
    city?: string;
    address?: string;
    province?: string;
    postalCode?: string | null;
    website?: string | null;
    businessType?: string | null;
    logoUrl?: string | null;
  } | null;
}

export default function CafeSetupWizard({
  isOpen,
  onClose,
  onComplete,
  businessName = "Your Café",
  initialProfile,
}: CafeSetupWizardProps) {
  const [step, setStep] = useState<WizardStep>("business-info");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Collected wizard data — auto-fill from existing profile (business request data)
  const [profileData, setProfileData] = useState<Record<string, string>>({ name: businessName || "" });
  const [logoBase64, setLogoBase64] = useState<string>("");

  // Sync businessName prop into profileData.name once prefill arrives (only if field is still the default)
  useEffect(() => {
    if (!businessName || businessName === "Your Café") return;
    setProfileData((prev) => {
      if (prev.name && prev.name !== "Your Café") return prev;
      return { ...prev, name: businessName };
    });
  }, [businessName]);

  // Auto-fill profile data from the existing restaurant record (populated from business request)
  useEffect(() => {
    if (!initialProfile) return;
    setProfileData((prev) => {
      // Only fill empty fields so user edits aren't overwritten
      const fill: Record<string, string> = {};
      if (!prev.name && (initialProfile as any).name) fill.name = (initialProfile as any).name;
      if (!prev.contactEmail && initialProfile.contactEmail) fill.contactEmail = initialProfile.contactEmail;
      if (!prev.contactName && initialProfile.contactName) fill.contactName = initialProfile.contactName;
      if (!prev.phone && initialProfile.phone) fill.phone = initialProfile.phone;
      if (!prev.city && initialProfile.city) fill.city = initialProfile.city;
      if (!prev.address && initialProfile.address) fill.address = initialProfile.address;
      if (!prev.province && initialProfile.province) fill.province = initialProfile.province;
      if (!prev.postalCode && initialProfile.postalCode) fill.postalCode = initialProfile.postalCode;
      if (!prev.website && initialProfile.website) fill.website = initialProfile.website;
      if (!prev.businessType && initialProfile.businessType) fill.businessType = initialProfile.businessType;
      return { ...prev, ...fill };
    });
    if (initialProfile.logoUrl && !logoBase64) {
      setLogoBase64(initialProfile.logoUrl);
    }
  }, [initialProfile]);
  const [tablesData, setTablesData] = useState<TableEntry[]>([
    { id: "1", name: "Table 1", capacity: "", type: "" },
    { id: "2", name: "Table 2", capacity: "2", type: "" },
  ]);
  const [hoursData, setHoursData] = useState<Record<string, DayHours>>({
    Monday: { enabled: true, open: "10:00 AM", close: "10:00 PM" },
    Tuesday: { enabled: true, open: "10:00 AM", close: "10:00 PM" },
    Wednesday: { enabled: true, open: "9:00 AM", close: "9:00 PM" },
    Thursday: { enabled: true, open: "11:00 AM", close: "11:00 PM" },
    Friday: { enabled: true, open: "10:00 AM", close: "10:00 PM" },
    Saturday: { enabled: true, open: "9:00 AM", close: "9:00 PM" },
    Sunday: { enabled: true, open: "11:00 AM", close: "11:00 PM" },
  });
  const [pricingData, setPricingData] = useState({
    pricingType: "hourly",
    hourlyRate: "8.00",
    coverFee: "",
    enableThreshold: true,
    minSpend: "15.00",
  });
  const [selectedGames, setSelectedGames] = useState<BGGGame[]>([]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // When pricing step continues, submit all data
  const { addGame } = useBusinessSettings();

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
    else onClose();
  };

  const goBack = () => {
    const idx = FLOW.indexOf(step);
    if (idx > 0) setStep(FLOW[idx - 1]);
    else onClose();
  };

  const handlePricingContinue = async () => {
    if (onComplete) {
      setSaving(true);
      setSaveError(null);
      const result = await onComplete({
        profile: profileData,
        tables: tablesData
          .filter((t) => t.name)
          .map((t) => ({
            name: t.name,
            capacity: parseInt(t.capacity) || 4,
            type: t.type || "Round",
          })),
        hours: DAYS.map((day) => ({
          dayOfWeek: day,
          openTime: timeStringToMinutes(hoursData[day]?.open || "10:00 AM"),
          closeTime: timeStringToMinutes(hoursData[day]?.close || "10:00 PM"),
          isClosed: !hoursData[day]?.enabled,
        })),
        pricing: pricingData,
        logoUrl: logoBase64 || undefined,
      });
      // After setup completes, add games one by one
      if (result.success && selectedGames.length > 0) {
        for (const game of selectedGames) {
          const [min, max] = (() => {
            const parts = game.players.replace("–", "-").split("-").map(Number);
            if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return [parts[0], parts[1]];
            const n = parseInt(game.players);
            return [isNaN(n) ? 1 : n, isNaN(n) ? 1 : n];
          })();
          const dur = (() => { const m = game.duration.match(/(\d+)/); return m ? parseInt(m[1]) : 60; })();
          await addGame({
            bggId: String(game.id),
            name: game.name,
            imageUrl: game.image || null,
            minPlayers: min,
            maxPlayers: max,
            estimatedPlayTime: dur,
            category: game.categories?.[0] ?? null,
            difficulty: game.difficulty ?? null,
          }).catch(() => {/* best-effort */});
        }
      }
      setSaving(false);
      if (result.success) goNext();
      else setSaveError(result.message || "Something went wrong. Please try again.");
    } else {
      goNext();
    }
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
          className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-white border border-teal-700 text-teal-700 hover:bg-teal-50 transition-colors focus-visible:outline-2 focus-visible:outline-teal-700 cursor-pointer"
        >
          <X size={14} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 px-7 py-8 pt-6 justify-center bg-white rounded-t-2xl">
          <div className="flex items-center gap-5 border-b border-teal-500 w-full px-0 py-4 -mx-7 -mb-4">
            <img
              src={gatoreLogo}
              alt="Gatore"
              className="w-16 h-8 sm:w-23.25 sm:h-12 object-contain shrink-0"
            />
            <div>
              <p className="text-[18px] sm:text-[24px] font-bold tracking-wide text-teal-800 uppercase leading-tight">
                Gatore
              </p>
              <p className="text-xs sm:text-sm text-neutral-500 leading-snug">
                {step === "success" ? "Your café's home base" : "Set up your café in minutes"}
              </p>
            </div>
          </div>
        </div>

        {/* Step progress */}
        {step !== "success" && <StepProgress current={stepNum} total={total} />}

        {/* Saving overlay */}
        {saving && (
          <div role="status" aria-label="Setting up your café" className="absolute inset-0 z-20 bg-white/80 flex items-center justify-center rounded-2xl">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-teal-600" aria-hidden="true" />
              <p className="text-sm text-neutral-600 font-medium">Setting up your café...</p>
            </div>
          </div>
        )}

        {/* Step content — scrollable */}
        <div className="flex-1 overflow-y-auto">
          {step === "business-info" && (
            <StepBusinessInfo
              onContinue={goNext}
              onBack={goBack}
              profileData={profileData}
              setProfileData={setProfileData}
              logoBase64={logoBase64}
              setLogoBase64={setLogoBase64}
              businessName={businessName}
            />
          )}
          {step === "tables" && (
            <StepTables onContinue={goNext} onBack={goBack} tables={tablesData} setTables={setTablesData} />
          )}
          {step === "hours" && (
            <StepHours onContinue={goNext} onBack={goBack} hours={hoursData} setHours={setHoursData} />
          )}
          {step === "games" && (
            <StepGames
              onContinue={goNext}
              onBack={goBack}
              selectedGames={selectedGames}
              setSelectedGames={setSelectedGames}
            />
          )}
          {step === "menu" && (
            <StepMenu onFinish={goNext} onBack={goBack} />
          )}
          {step === "pricing" && (
            <StepPricing
              onContinue={handlePricingContinue}
              onBack={goBack}
              pricingData={pricingData}
              setPricingData={setPricingData}
              saveError={saveError}
            />
          )}
          {step === "success" && (
            <StepSuccess onFinish={onClose} />
          )}
        </div>

        {/* Powered by footer */}
        <div className="py-3 text-center text-xs text-gray-400 border-t border-gray-100 shrink-0">
          Powered by{" "}
          <span className="font-bold text-teal-700 tracking-wide">GATORE</span>
        </div>
      </div>
    </div>
  );
}
