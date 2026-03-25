import { useState, useEffect, useRef, useCallback } from "react";
import {
  X,
  ChevronDown,
  Plus,
  Trash2,
  Check,
  Globe,
  PlusCircle,
  ClipboardList,
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
import { StepProgress } from "../auth/StepProgress";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
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
        <h2 className="text-xl font-bold text-gray-900">
          Set up your business account for{" "}
          <span className="text-gray-900">{businessName}</span>
        </h2>
        <p className="text-sm text-gray-400 mt-0.5">
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
                ? "border-teal-300 bg-teal-50/30"
                : "border-gray-200 hover:border-teal-300 hover:bg-teal-50/20"
          }`}
        >
          {logoBase64 ? (
            <div className="flex items-center gap-4">
              <img
                src={logoBase64}
                alt="Café logo preview"
                className="w-16 h-16 rounded-xl object-cover border border-gray-200"
              />
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">Logo uploaded</p>
                <p className="text-xs text-teal-600 mt-0.5">Click or drag to replace</p>
              </div>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-2">
                <ImagePlus size={22} className="text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-700">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
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
          <p className="text-xs text-red-500 mt-1.5">{errors.logo}</p>
        )}
      </div>

      <Input
        label="Email Address"
        type="email"
        placeholder="contact@yourbusiness.com"
        value={profileData.contactEmail || ""}
        onChange={update("contactEmail")}
        error={errors.contactEmail ?? undefined}
      />
      <Input
        label="Contact Name"
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

      <h3 className="text-base font-bold text-gray-900 mt-2">
        Business Address
      </h3>
      <Input
        label="Street Address"
        placeholder="123 Main Street"
        value={profileData.address || ""}
        onChange={update("address")}
        error={errors.address ?? undefined}
      />
      <div className="grid grid-cols-3 gap-4">
        <Input label="City" placeholder="City" value={profileData.city || ""} onChange={update("city")} error={errors.city ?? undefined} />
        <Input label="Province" placeholder="Province" value={profileData.province || ""} onChange={update("province")} error={errors.province ?? undefined} />
        <Input label="Postal Code" placeholder="Postal Code" value={profileData.postalCode || ""} onChange={update("postalCode")} error={errors.postalCode ?? undefined} />
      </div>

      <div className="flex gap-3 mt-2">
        <Button variant="outline" fullWidth onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" fullWidth onClick={handleContinue}>
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
        <h2 className="text-xl font-bold text-gray-900">Tables & Seating</h2>
        <p className="text-sm text-gray-400 mt-0.5">
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
              className={`border rounded-xl p-5 ${
                Object.values(errs).some((e) => e) ? "border-red-300" : "border-gray-200"
              }`}
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
                  error={errs.name ?? undefined}
                />
                <div className="space-y-1">
                  <SelectField
                    label="Capacity"
                    options={["2", "4", "6", "8", "10", "12"]}
                    value={t.capacity}
                    onChange={(v) => updateTable(t.id, { capacity: v })}
                  />
                  {errs.capacity && <p className="text-xs text-red-500">{errs.capacity}</p>}
                </div>
                <div className="space-y-1">
                  <SelectField
                    label="Table Type"
                    options={["Round", "Square", "Booth", "High-Top"]}
                    value={t.type}
                    onChange={(v) => updateTable(t.id, { type: v })}
                  />
                  {errs.type && <p className="text-xs text-red-500">{errs.type}</p>}
                </div>
              </div>
            </div>
          );
        })}
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
        <Button variant="primary" fullWidth onClick={handleContinue}>
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

function complexityDots(weightDots: number) {
  const count = Math.min(weightDots, 3);
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <span key={i} className={`w-2 h-2 rounded-full ${i < count ? "bg-amber-500" : "bg-gray-200"}`} />
      ))}
      <span className="text-[10px] text-gray-500 ml-0.5">
        {["Easy", "Medium", "Hard"][Math.min(count - 1, 2)] ?? "Easy"}
      </span>
    </div>
  );
}

function parsePlayers(players: string): [number, number] {
  const parts = players.replace("–", "-").split("-").map(Number);
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return [parts[0], parts[1]];
  const n = parseInt(players);
  return [isNaN(n) ? 1 : n, isNaN(n) ? 1 : n];
}

function parseDuration(duration: string): number {
  const m = duration.match(/(\d+)/);
  return m ? parseInt(m[1]) : 60;
}

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
        <h2 className="text-xl font-bold text-gray-900">Game Library</h2>
        <p className="text-sm text-gray-400 mt-0.5">
          Search BoardGameGeek and add the games your café offers (optional)
        </p>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search for a game… (e.g. Catan, Ticket to Ride)"
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
        />
      </div>

      {/* Selected games chips */}
      {selectedGames.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedGames.map((g) => (
            <span key={g.id} className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 text-teal-700 text-xs font-semibold px-2.5 py-1.5 rounded-full">
              {g.name}
              <button onClick={() => toggleGame(g)} className="hover:text-red-500 cursor-pointer"><X size={11} /></button>
            </span>
          ))}
        </div>
      )}

      {/* Results */}
      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
          ))}
        </div>
      )}

      {!loading && games.length > 0 && (
        <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
          {games.map((game) => {
            const selected = selectedBggIds.has(String(game.id));
            const [min, max] = parsePlayers(game.players);
            const dur = parseDuration(game.duration);
            return (
              <button
                key={game.id}
                onClick={() => toggleGame(game)}
                className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left cursor-pointer ${
                  selected
                    ? "border-teal-400 bg-teal-50/60"
                    : "border-gray-200 hover:border-teal-200 bg-white"
                }`}
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {game.image ? <img src={game.image} alt={game.name} className="w-full h-full object-cover" /> : null}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{game.name}</p>
                  {complexityDots(game.weightDots)}
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                    <span className="flex items-center gap-1"><Users size={10} />{min === max ? min : `${min}–${max}`}</span>
                    <span className="flex items-center gap-1"><Clock size={10} />{dur} min</span>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1 ${selected ? "bg-teal-600" : "border-2 border-gray-300"}`}>
                  {selected && <Check size={12} className="text-white" />}
                </div>
              </button>
            );
          })}
          {hasMore && (
            <button onClick={loadMore} disabled={loadingMore} className="w-full py-2 text-xs font-medium text-teal-600 border border-teal-200 rounded-lg hover:bg-teal-50 cursor-pointer disabled:opacity-50">
              {loadingMore ? "Loading…" : "Load more"}
            </button>
          )}
        </div>
      )}

      {!loading && !query && games.length === 0 && (
        <p className="text-xs text-gray-400 text-center py-2">Start typing to search the BoardGameGeek database</p>
      )}

      {/* Footer */}
      <div className="flex gap-3 mt-1">
        <Button variant="outline" fullWidth onClick={onBack}>Back</Button>
        <Button variant="primary" fullWidth onClick={onContinue}>
          {selectedGames.length > 0 ? `Continue with ${selectedGames.length} game${selectedGames.length !== 1 ? "s" : ""}` : "Skip for Now"}
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
  pricingData,
  setPricingData,
}: {
  onContinue: () => void;
  onBack: () => void;
  pricingData: { pricingType: string; hourlyRate: string; enableThreshold: boolean; minSpend: string };
  setPricingData: React.Dispatch<React.SetStateAction<{ pricingType: string; hourlyRate: string; enableThreshold: boolean; minSpend: string }>>;
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
            <Input
              label="Hourly Rate"
              placeholder="$ 8.00"
              value={pricingData.hourlyRate}
              onChange={(e) => {
                setPricingData((p) => ({ ...p, hourlyRate: e.target.value }));
                setErrors((prev) => ({ ...prev, hourlyRate: null }));
              }}
              error={errors.hourlyRate ?? undefined}
            />
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
                <Input
                  label="Minimum Spend Amount"
                  placeholder="$ 15.00"
                  value={pricingData.minSpend}
                  onChange={(e) => {
                    setPricingData((p) => ({ ...p, minSpend: e.target.value }));
                    setErrors((prev) => ({ ...prev, minSpend: null }));
                  }}
                  error={errors.minSpend ?? undefined}
                />
                <div className="bg-[#eef2ff] border border-blue-200 rounded-lg p-3 flex gap-2">
                  <span className="text-blue-500 shrink-0 font-bold border border-blue-500 rounded-full w-4 h-4 flex items-center justify-center text-[10px] mt-0.5">i</span>
                  <p className="text-xs text-blue-800 leading-snug">
                    If customers spend{" "}
                    <span className="font-bold">${parseFloat(pricingData.minSpend) || 0}</span> or more on
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
              ${parseFloat(pricingData.hourlyRate) || 0}<span className="text-sm font-normal text-gray-500">/hour</span>
            </p>
            <div className="flex flex-col gap-2 text-sm text-gray-600">
              <span>✓ 1 hour: ${(parseFloat(pricingData.hourlyRate) || 0).toFixed(2)}</span>
              <span>✓ 2 hours: ${((parseFloat(pricingData.hourlyRate) || 0) * 2).toFixed(2)}</span>
              <span>✓ 3 hours: ${((parseFloat(pricingData.hourlyRate) || 0) * 3).toFixed(2)}</span>
              {enableThreshold && (
                <span className="text-teal-600 font-medium">
                  ✓ Free with ${parseFloat(pricingData.minSpend) || 0}+ purchase
                </span>
              )}
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
        <Button variant="primary" fullWidth onClick={handleContinue}>
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

  // Collected wizard data — auto-fill from existing profile (business request data)
  const [profileData, setProfileData] = useState<Record<string, string>>({});
  const [logoBase64, setLogoBase64] = useState<string>("");

  // Auto-fill profile data from the existing restaurant record (populated from business request)
  useEffect(() => {
    if (!initialProfile) return;
    setProfileData((prev) => {
      // Only fill empty fields so user edits aren't overwritten
      const fill: Record<string, string> = {};
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

  // When pricing step continues, submit all data
  const { addGame } = useBusinessSettings();

  const handlePricingContinue = async () => {
    if (onComplete) {
      setSaving(true);
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
          className="absolute top-3 right-3 z-10 w-7 h-7 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>

        {/* Header */}
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

        {/* Saving overlay */}
        {saving && (
          <div className="absolute inset-0 z-20 bg-white/80 flex items-center justify-center rounded-2xl">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={32} className="animate-spin text-teal-600" />
              <p className="text-sm text-gray-600 font-medium">Setting up your café...</p>
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
            />
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
