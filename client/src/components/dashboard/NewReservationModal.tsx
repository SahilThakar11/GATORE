import { useState } from "react";
import { X, ChevronDown, Loader2 } from "lucide-react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

interface NewReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tables?: { id: number; name: string; capacity: number }[];
  onCreateWalkIn?: (data: {
    customerName: string;
    email?: string;
    phone?: string;
    partySize: number;
    tableId: number;
    specialRequests?: string;
    source?: string;
  }) => Promise<{ success: boolean; message?: string }>;
}

/* ─── Styled select wrapper ─────────────────────────────────────── */
function SelectField({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-neutral-800">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none px-4 py-3 border border-warm-200 rounded-lg text-sm text-gray-600 outline-none transition-colors focus:ring-2 focus:ring-teal-500 cursor-pointer"
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
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

/* ─── Modal ─────────────────────────────────────────────────────── */
export default function NewReservationModal({
  isOpen,
  onClose,
  tables = [],
  onCreateWalkIn,
}: NewReservationModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [guests, setGuests] = useState("");
  const [table, setTable] = useState("");
  const [source, setSource] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      });
      setLoading(false);
      if (!result.success) {
        setError(result.message || "Failed to create reservation.");
      } else {
        // Reset form
        setName(""); setEmail(""); setPhone(""); setGuests("");
        setTable(""); setSource(""); setSpecialRequests("");
      }
    } else {
      onClose();
    }
  };

  const guestOptions = Array.from({ length: 10 }, (_, i) => ({
    label: String(i + 1),
    value: String(i + 1),
  }));

  const tableOptions = tables.map((t) => ({
    label: `${t.name} (${t.capacity} seats)`,
    value: String(t.id),
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-[#fefcf9] rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">
        {/* ── Header ────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">New Reservation</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Body (scrollable) ─────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
              {error}
            </div>
          )}

          <h3 className="text-base font-bold text-gray-900 mb-4">
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

          <div className="h-px bg-gradient-to-r from-transparent via-teal-300 to-transparent my-6" />

          <h3 className="text-base font-bold text-gray-900 mb-4">
            Reservation Details
          </h3>

          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <SelectField
                label="Number of Guests"
                options={guestOptions}
                value={guests}
                onChange={setGuests}
              />
              <SelectField
                label="Table"
                options={tableOptions}
                value={table}
                onChange={setTable}
              />
            </div>

            <SelectField
              label="Reservation Source"
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
              <label className="block text-sm font-medium text-neutral-800">
                Special Requests (Optional)
              </label>
              <textarea
                placeholder="Any dietary restrictions, accessibility needs, or special occasions..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-warm-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 outline-none transition-colors focus:ring-2 focus:ring-teal-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* ── Footer ────────────────────────────────────────── */}
        <div className="px-6 pb-5 pt-3">
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" fullWidth onClick={handleCreate} disabled={loading}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={15} className="animate-spin" />
                  Creating...
                </span>
              ) : (
                "Create Reservation"
              )}
            </Button>
          </div>
          <p className="text-center text-[11px] text-gray-400 mt-3">
            Powered by{" "}
            <span className="font-bold text-teal-700 tracking-wide">GATORE</span>
          </p>
        </div>
      </div>
    </div>
  );
}
