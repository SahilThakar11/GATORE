import { useState, useEffect, useId } from "react";
import { X, Loader2 } from "lucide-react";
import { Input } from "../ui/Input";
import { Dropdown } from "../ui/Dropdown";
import { AlertBanner } from "../ui/AlertBanner";
import { PrimaryButton } from "../ui/PrimaryButton";
import { SecondaryButton } from "../ui/SecondaryButton";

interface NewReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables?: { id: number; name: string; capacity: number }[];
  games?: { id: number; name: string }[];
  onCreateWalkIn?: (data: {
    customerName: string;
    email?: string;
    phone?: string;
    partySize: number;
    tableId: number;
    specialRequests?: string;
    source?: string;
    reservationDate?: string;
    arrivalTime?: string;
    durationHours?: number;
    gameId?: number;
  }) => Promise<{ success: boolean; message?: string }>;
}

/* ─── Helpers ────────────────────────────────────────────────── */
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function currentTimeRounded() {
  const d = new Date();
  const minutes = Math.ceil(d.getMinutes() / 15) * 15;
  const h = d.getHours() + Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h % 24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/* ─── Select wrapper using Dropdown component ───────────────────── */
function SelectField({
  label,
  placeholder,
  options,
  value,
  onChange,
  disabled,
}: {
  label: string;
  placeholder: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const id = useId();
  const selected = options.find((o) => o.value === value);
  return (
    <div className="space-y-2">
      <label id={id} className="block text-sm font-medium text-neutral-800">
        {label}
      </label>
      <Dropdown
        trigger="label"
        triggerLabel={selected?.label ?? placeholder}
        isPlaceholder={!selected}
        fullWidth
        disabled={disabled}
        items={options.map((opt) => ({ label: opt.label, onClick: () => onChange(opt.value) }))}
        triggerClassName={disabled ? "bg-warm-50 opacity-50 cursor-not-allowed" : "bg-warm-50"}
      />
    </div>
  );
}

/* ─── Modal ─────────────────────────────────────────────────────── */
export default function NewReservationModal({
  isOpen,
  onClose,
  tables = [],
  games = [],
  onCreateWalkIn,
}: NewReservationModalProps) {
  const titleId = useId();
  const specialRequestsId = useId();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState("");
  const [table, setTable] = useState("");
  const [game, setGame] = useState("");
  const [source, setSource] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [reservationDate, setReservationDate] = useState(todayISO);
  const [arrivalTime, setArrivalTime] = useState(currentTimeRounded);
  const [duration, setDuration] = useState("2");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!name.trim() || !guests || !table) {
      setError("Name, guests, and table are required.");
      return;
    }
    if (onCreateWalkIn) {
      setLoading(true);
      setError(null);
      const result = await onCreateWalkIn({
        customerName: name,
        email: email || undefined,
        phone: phone || undefined,
        partySize: parseInt(guests),
        tableId: parseInt(table),
        specialRequests: specialRequests || undefined,
        source: source || undefined,
        reservationDate,
        arrivalTime,
        durationHours: parseFloat(duration),
        gameId: game ? parseInt(game) : undefined,
      });
      setLoading(false);
      if (!result.success) {
        setError(result.message || "Failed to create reservation.");
      } else {
        setName(""); setEmail(""); setPhone(""); setGuests("");
        setTable(""); setGame(""); setSource(""); setSpecialRequests("");
        setReservationDate(todayISO());
        setArrivalTime(currentTimeRounded());
        setDuration("2");
        onClose();
      }
    } else {
      onClose();
    }
  };

  const guestOptions = Array.from({ length: 10 }, (_, i) => ({
    label: `${i + 1} guest${i > 0 ? "s" : ""}`,
    value: String(i + 1),
  }));

  const tableOptions = tables.map((t) => ({
    label: `${t.name} (${t.capacity} seats)`,
    value: String(t.id),
  }));

  const gameOptions = games.map((g) => ({ label: g.name, value: String(g.id) }));

  const durationOptions = [
    { label: "1 hour", value: "1" },
    { label: "1.5 hours", value: "1.5" },
    { label: "2 hours", value: "2" },
    { label: "2.5 hours", value: "2.5" },
    { label: "3 hours", value: "3" },
    { label: "3.5 hours", value: "3.5" },
    { label: "4 hours", value: "4" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
        {/* ── Header ────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-teal-600">
          <h2 id={titleId} className="text-lg font-bold text-neutral-800">New Reservation</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-teal-700 text-teal-700 hover:bg-teal-50 transition-colors focus-visible:outline-2 focus-visible:outline-teal-700 cursor-pointer"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>

        {/* ── Body (scrollable) ─────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {error && (
            <AlertBanner
              variant="error"
              title={error}
              dismissible
              onDismiss={() => setError(null)}
              className="mb-4"
            />
          )}

          <h3 className="text-base font-bold text-neutral-800 mb-4">
            Customer Information
          </h3>

          <div className="flex flex-col gap-4">
            <Input
              label="Customer Name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                label="Phone number"
                type="tel"
                placeholder="(234)-567-8901"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div className="h-px bg-warm-300 my-6" />

          <h3 className="text-base font-bold text-neutral-800 mb-4">
            Reservation Details
          </h3>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date"
                type="date"
                value={reservationDate}
                onChange={(e) => setReservationDate(e.target.value)}
              />
              <Input
                label="Arrival Time"
                type="time"
                value={arrivalTime}
                onChange={(e) => setArrivalTime(e.target.value)}
              />
            </div>

            <SelectField
              label="Duration"
              placeholder="Select duration"
              options={durationOptions}
              value={duration}
              onChange={setDuration}
            />

            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Number of Guests"
                placeholder="Select guests"
                options={guestOptions}
                value={guests}
                onChange={setGuests}
              />
              <SelectField
                label="Table"
                placeholder="Select table"
                options={tableOptions}
                value={table}
                onChange={setTable}
              />
            </div>

            <SelectField
              label="Game (optional)"
              placeholder={gameOptions.length === 0 ? "No games in library" : "No game selected"}
              options={gameOptions}
              value={game}
              onChange={setGame}
              disabled={gameOptions.length === 0}
            />

            <SelectField
              label="Reservation Source"
              placeholder="Select source"
              options={[
                { label: "Walk-in", value: "Walk-in" },
                { label: "Phone", value: "Phone" },
                { label: "Online", value: "Online" },
                { label: "Email", value: "Email" },
              ]}
              value={source}
              onChange={setSource}
            />

            <div className="space-y-2">
              <label htmlFor={specialRequestsId} className="block text-sm font-medium text-neutral-800">
                Special Requests <span className="font-normal text-neutral-500">(Optional)</span>
              </label>
              <textarea
                id={specialRequestsId}
                placeholder="Any dietary restrictions, accessibility needs, or special occasions..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-warm-200 rounded-lg text-sm sm:text-base text-neutral-700 placeholder:text-neutral-500 bg-warm-50 outline-none transition-colors focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────── */}
        <div className="px-6 pb-5 pt-3 border-t border-warm-200">
          <div className="flex gap-3 [&>div]:flex-1 [&>div>button]:w-full">
            <div>
              <SecondaryButton label="Cancel" onClick={onClose} />
            </div>
            <div>
              <PrimaryButton
                label={loading ? "Creating..." : "Create Reservation"}
                onClick={handleCreate}
                disabled={loading}
                rightIcon={loading ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : undefined}
              />
            </div>
          </div>
          <p className="text-center text-xs text-neutral-500 mt-3">
            Powered by{" "}
            <span className="font-bold text-teal-700 tracking-wide">GATORE</span>
          </p>
        </div>
      </div>
    </div>
  );
}
