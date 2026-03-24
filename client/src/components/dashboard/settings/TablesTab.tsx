import { useState, useEffect } from "react";
import { Armchair, X, Plus, Loader2, AlertCircle } from "lucide-react";
import { SettingsPanel } from "./SettingsPanel";
import { SelectField } from "./SelectField";
import { useBusinessSettings, type TableConfig } from "../../../hooks/useBusinessSettings";

export default function TablesTab({ onBack }: { onBack: () => void }) {
  const { fetchTables, addTable, removeTable } = useBusinessSettings();
  const [tables, setTables] = useState<TableConfig[]>([]);
  const [newCapacity, setNewCapacity] = useState("");
  const [newType, setNewType] = useState("");
  const [loading, setLoading] = useState(true);
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
    // Validate selections
    if (!newCapacity || !newType) {
      setAddError(
        !newCapacity && !newType
          ? "Please select a capacity and table type."
          : !newCapacity
          ? "Please select a capacity."
          : "Please select a table type."
      );
      return;
    }
    setAddError(null);

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
    }
  };

  if (loading) {
    return (
      <SettingsPanel title="Tables & Seating" subtitle="Manage your table configurations" onBack={onBack}>
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
    >
      <h3 className="text-sm font-bold text-gray-900 mb-3">
        Current Tables ({tables.length})
      </h3>
      <div className="flex flex-col gap-3 mb-6">
        {tables.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-warm-200 flex items-center justify-center">
                <Armchair size={16} className="text-warm-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-gray-900">{t.name}</p>
                  <span className="text-[10px] bg-warm-200 text-warm-700 px-2 py-0.5 rounded-full font-semibold">
                    {t.type}
                  </span>
                </div>
                <p className="text-xs text-gray-400">{t.capacity} seats</p>
              </div>
            </div>
            <button
              onClick={() => handleRemove(t.id)}
              className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Add tables */}
      <h3 className="text-sm font-bold text-gray-900 mb-3">Add Tables</h3>
      <div className="border border-gray-200 rounded-xl p-5">
        <p className="text-sm font-bold text-gray-900 mb-1">
          Table {tables.length + 1}
        </p>
        <div className="flex items-end gap-3 mt-3">
          <div className="flex-1">
            <SelectField
              label="Capacity"
              options={["2", "4", "6", "8", "10", "12"]}
              value={newCapacity}
              onChange={(v) => { setNewCapacity(v); setAddError(null); }}
            />
          </div>
          <div className="flex-1">
            <SelectField
              label="Table Type"
              options={["Round", "Square", "Booth", "High-Top"]}
              value={newType}
              onChange={(v) => { setNewType(v); setAddError(null); }}
            />
          </div>
          <button
            onClick={handleAdd}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-teal-50 border-2 border-teal-200 text-teal-600 hover:bg-teal-100 transition-colors cursor-pointer shrink-0"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Inline error */}
        {addError && (
          <div className="flex items-center gap-1.5 mt-2 text-xs text-red-500">
            <AlertCircle size={13} />
            {addError}
          </div>
        )}
      </div>
    </SettingsPanel>
  );
}
