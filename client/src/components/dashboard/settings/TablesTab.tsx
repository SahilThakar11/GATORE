import { useState, useEffect } from "react";
import { X, Plus, Loader2, AlertCircle } from "lucide-react";
import { SecondaryButton } from "../../ui/SecondaryButton";
import { SettingsPanel } from "./SettingsPanel";
import { SelectField } from "./SelectField";
import { TableIcon } from "../../ui/TableIcon";
import {
  useBusinessSettings,
  type TableConfig,
} from "../../../hooks/useBusinessSettings";

export default function TablesTab({ onBack }: { onBack: () => void }) {
  const { fetchTables, addTable, removeTable, saving } = useBusinessSettings();
  const [tables, setTables] = useState<TableConfig[]>([]);
  const [newCapacity, setNewCapacity] = useState("");
  const [newType, setNewType] = useState("");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    fetchTables().then((data) => {
      setTables(data);
      setLoading(false);
    });
  }, [fetchTables]);

  const handleRemove = async (id: number) => {
    const result = await removeTable(id);
    if (result.success) setTables((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAdd = async () => {
    if (!newCapacity || !newType) {
      setAddError(
        !newCapacity && !newType
          ? "Please select a capacity and table type."
          : !newCapacity
            ? "Please select a capacity."
            : "Please select a table type.",
      );
      return;
    }
    setAddError(null);
    setAdding(true);
    try {
      const nextNum = tables.length + 1;
      const result = await addTable({
        name: `Table ${nextNum}`,
        capacity: parseInt(newCapacity) || 4,
        type: newType || "Round",
      });
      if (result.success) {
        setTables((prev) => [...prev, result.data]);
        setNewCapacity("");
        setNewType("");
      } else {
        setAddError(result.message ?? "Failed to add table. Please try again.");
      }
    } catch (e) {
      setAddError(`Error: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <SettingsPanel
        title="Tables & Seating"
        subtitle="Manage your table configurations"
        onBack={onBack}
      >
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-teal-600" />
        </div>
      </SettingsPanel>
    );
  }

  return (
    <SettingsPanel
      title="Tables & Seating"
      subtitle="Manage your table configurations"
      onBack={onBack}
      onSave={async () => true}
      saving={saving}
    >
      <h3 className="text-sm font-bold text-neutral-800 mb-3">
        Current Tables ({tables.length})
      </h3>
      <div className="flex flex-col gap-3 mb-6">
        {tables.map((t) => (
          <div
            key={t.id}
            className="flex items-center bg-warm-50 justify-between border border-warm-300 rounded-xl px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-warm-200 flex items-center justify-center">
                <TableIcon
                  type={t.type as "Round" | "Square" | "Booth" | "High-Top"}
                  capacity={t.capacity}
                  size={24}
                  className="text-warm-700"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[14px] font-bold text-neutral-800">
                    {t.name}
                  </p>
                  <span className="text-[12px] bg-warm-200 text-warm-700 px-2 py-0.5 rounded-full font-semibold">
                    {t.type}
                  </span>
                </div>
                <p className="text-[12px] text-neutral-500">
                  {t.capacity} seats
                </p>
              </div>
            </div>
            <button
              onClick={() => handleRemove(t.id)}
              aria-label={`Remove ${t.name}`}
              className="text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      {/* Add tables */}
      <h3 className="text-sm font-bold text-neutral-800 mb-3">Add Tables</h3>
      <div className="border border-warm-200 rounded-xl p-5 bg-warm-50 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Capacity"
            options={["2", "4", "6", "8", "10", "12"]}
            value={newCapacity}
            onChange={(v) => {
              setNewCapacity(v);
              setAddError(null);
            }}
            triggerClassName="bg-white"
          />
          <SelectField
            label="Table Type"
            options={["Round", "Square", "Booth", "High-Top"]}
            value={newType}
            onChange={(v) => {
              setNewType(v);
              setAddError(null);
            }}
            triggerClassName="bg-white"
          />
        </div>
        <div className="[&>button]:w-full">
          <SecondaryButton
            label={adding ? "Adding..." : "Add Table"}
            onClick={handleAdd}
            disabled={adding}
            leftIcon={adding ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} aria-hidden="true" />}
          />
        </div>

        {/* Inline error */}
        {addError && (
          <div role="alert" aria-live="polite" className="flex items-center gap-1.5 mt-2 text-xs text-red-500">
            <AlertCircle size={13} aria-hidden="true" />
            {addError}
          </div>
        )}
      </div>
    </SettingsPanel>
  );
}
