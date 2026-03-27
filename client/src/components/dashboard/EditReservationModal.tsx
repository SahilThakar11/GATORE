import { useState, useEffect, useId } from "react";
import { X, Loader2 } from "lucide-react";
import { Input } from "../ui/Input";
import { Dropdown } from "../ui/Dropdown";
import { AlertBanner } from "../ui/AlertBanner";
import { PrimaryButton } from "../ui/PrimaryButton";
import { SecondaryButton } from "../ui/SecondaryButton";
import type { DashboardReservation } from "../../hooks/useBusinessDashboard";

interface EditReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservation: DashboardReservation;
  tables?: { id: number; name: string; capacity: number }[];
  games?: { id: number; name: string }[];
  onSave: (id: number, data: {
    customerName?: string;
    tableId?: number;
    partySize?: number;
    reservationDate?: string;
    arrivalTime?: string;
    durationHours?: number;
    specialRequests?: string;
    gameId?: number | null;
  }) => Promise<{ success: boolean; message?: string }>;
}

function toDateISO(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toTimeHHMM(dateStr: string) {
  const d = new Date(dateStr);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function durationHours(start: string, end: string) {
  return ((new Date(end).getTime() - new Date(start).getTime()) / 3600000).toFixed(1);
}


function SelectField({ label, placeholder, options, value, onChange, disabled }: {
  label: string; placeholder: string;
  options: { label: string; value: string }[];
  value: string; onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const id = useId();
  const selected = options.find((o) => o.value === value);
  return (
    <div className="space-y-2">
      <label id={id} className="block text-sm font-medium text-neutral-800">{label}</label>
      <Dropdown
        trigger="label" triggerLabel={selected?.label ?? placeholder}
        isPlaceholder={!selected} fullWidth
        disabled={disabled}
        items={options.map((opt) => ({ label: opt.label, onClick: () => onChange(opt.value) }))}
        triggerClassName={disabled ? "bg-warm-50 opacity-50 cursor-not-allowed" : "bg-warm-50"}
      />
    </div>
  );
}

export default function EditReservationModal({
  isOpen, onClose, reservation, tables = [], games = [], onSave,
}: EditReservationModalProps) {
  const titleId = useId();
  const specialRequestsId = useId();

  const [customerName, setCustomerName] = useState(reservation.user.name);
  const [date, setDate] = useState(toDateISO(reservation.startTime));
  const [time, setTime] = useState(toTimeHHMM(reservation.startTime));
  const [duration, setDuration] = useState(durationHours(reservation.startTime, reservation.endTime));
  const [guests, setGuests] = useState(String(reservation.partySize));
  const [table, setTable] = useState(String(reservation.table.id));
  const [specialRequests, setSpecialRequests] = useState(reservation.specialRequests ?? "");
  const [game, setGame] = useState(String(reservation.gameReservations?.[0]?.game?.id ?? ""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset fields if reservation changes
  useEffect(() => {
    setCustomerName(reservation.user.name);
    setDate(toDateISO(reservation.startTime));
    setTime(toTimeHHMM(reservation.startTime));
    setDuration(durationHours(reservation.startTime, reservation.endTime));
    setGuests(String(reservation.partySize));
    setTable(String(reservation.table.id));
    setSpecialRequests(reservation.specialRequests ?? "");
    setGame(String(reservation.gameReservations?.[0]?.game?.id ?? ""));
    setError(null);
  }, [reservation]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    const result = await onSave(reservation.id, {
      customerName: customerName.trim() || undefined,
      tableId: parseInt(table),
      partySize: parseInt(guests),
      reservationDate: date,
      arrivalTime: time,
      durationHours: parseFloat(duration),
      specialRequests: specialRequests || undefined,
      gameId: game ? parseInt(game) : null,
    });
    setLoading(false);
    if (!result.success) {
      setError(result.message || "Failed to update reservation.");
    } else {
      onClose();
    }
  };

  const guestOptions = Array.from({ length: 10 }, (_, i) => ({
    label: `${i + 1} guest${i > 0 ? "s" : ""}`, value: String(i + 1),
  }));

  const tableOptions = tables.map((t) => ({
    label: `${t.name} (${t.capacity} seats)`, value: String(t.id),
  }));

  const gameOptions = games.map((g) => ({ label: g.name, value: String(g.id) }));

  const durationOptions = [
    { label: "1 hour", value: "1" }, { label: "1.5 hours", value: "1.5" },
    { label: "2 hours", value: "2" }, { label: "2.5 hours", value: "2.5" },
    { label: "3 hours", value: "3" }, { label: "3.5 hours", value: "3.5" },
    { label: "4 hours", value: "4" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-teal-600">
          <div>
            <h2 id={titleId} className="text-lg font-bold text-neutral-800">Modify Reservation</h2>
            <p className="text-xs text-neutral-500 mt-0.5">{reservation.user.name} · #{reservation.id}</p>
          </div>
          <button onClick={onClose} aria-label="Close"
            className="w-7 h-7 flex items-center justify-center rounded-full bg-white border border-teal-700 text-teal-700 hover:bg-teal-50 transition-colors focus-visible:outline-2 focus-visible:outline-teal-700 cursor-pointer">
            <X size={14} aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {error && (
            <AlertBanner variant="error" title={error} dismissible onDismiss={() => setError(null)} className="mb-4" />
          )}

          <h3 className="text-base font-bold text-neutral-800 mb-4">Customer</h3>
          <div className="mb-6">
            <Input
              label="Customer Name"
              placeholder="John Doe"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div className="h-px bg-warm-300 mb-6" />

          <h3 className="text-base font-bold text-neutral-800 mb-4">Reservation Details</h3>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              <Input label="Arrival Time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <SelectField label="Duration" placeholder="Select duration" options={durationOptions} value={duration} onChange={setDuration} />
            <div className="grid grid-cols-2 gap-4">
              <SelectField label="Number of Guests" placeholder="Select guests" options={guestOptions} value={guests} onChange={setGuests} />
              <SelectField label="Table" placeholder="Select table" options={tableOptions} value={table} onChange={setTable} />
            </div>

            <SelectField
              label="Game (optional)"
              placeholder={gameOptions.length === 0 ? "No games in library" : "No game selected"}
              options={gameOptions}
              value={game}
              onChange={setGame}
              disabled={gameOptions.length === 0}
            />

            <div className="h-px bg-warm-300" />

            <div className="space-y-2">
              <label htmlFor={specialRequestsId} className="block text-sm font-medium text-neutral-800">
                Special Requests <span className="font-normal text-neutral-500">(Optional)</span>
              </label>
              <textarea
                id={specialRequestsId}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
                placeholder="Any dietary restrictions, accessibility needs, or special occasions..."
                className="w-full px-4 py-3 border border-warm-200 rounded-lg text-sm text-neutral-700 placeholder:text-neutral-500 bg-warm-50 outline-none transition-colors focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="px-6 pb-5 pt-3 border-t border-warm-200">
          <div className="flex gap-3 [&>div]:flex-1 [&>div>button]:w-full">
            <div><SecondaryButton label="Cancel" onClick={onClose} /></div>
            <div>
              <PrimaryButton
                label={loading ? "Saving..." : "Save Changes"}
                onClick={handleSave}
                disabled={loading}
                rightIcon={loading ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : undefined}
              />
            </div>
          </div>
          <p className="text-center text-xs text-neutral-500 mt-3">
            Powered by <span className="font-bold text-teal-700 tracking-wide">GATORE</span>
          </p>
        </div>
      </div>
    </div>
  );
}
