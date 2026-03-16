import { useState } from "react";
import { Armchair, X, Plus } from "lucide-react";
import { SettingsPanel } from "./SettingsPanel";
import { SelectField } from "./SelectField";

interface TableConfig {
  id: string;
  name: string;
  type: "Round" | "Square";
  seats: number;
}

const MOCK_TABLES: TableConfig[] = [
  { id: "1", name: "Table 1", type: "Round", seats: 4 },
  { id: "2", name: "Table 2", type: "Square", seats: 4 },
  { id: "3", name: "Table 3", type: "Round", seats: 4 },
  { id: "4", name: "Table 4", type: "Square", seats: 8 },
];

export default function TablesTab({ onBack }: { onBack: () => void }) {
  const [tables, setTables] = useState<TableConfig[]>(MOCK_TABLES);
  const [newCapacity, setNewCapacity] = useState("");
  const [newType, setNewType] = useState("");

  const removeTable = (id: string) =>
    setTables((prev) => prev.filter((t) => t.id !== id));

  const addTable = () => {
    const nextNum = tables.length + 1;
    setTables((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: `Table ${nextNum}`,
        type: (newType as "Round" | "Square") || "Round",
        seats: parseInt(newCapacity) || 4,
      },
    ]);
    setNewCapacity("");
    setNewType("");
  };

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
                <p className="text-xs text-gray-400">{t.seats} seats</p>
              </div>
            </div>
            <button
              onClick={() => removeTable(t.id)}
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
              onChange={setNewCapacity}
            />
          </div>
          <div className="flex-1">
            <SelectField
              label="Table Type"
              options={["Round", "Square", "Booth", "High-Top"]}
              value={newType}
              onChange={setNewType}
            />
          </div>
          <button
            onClick={addTable}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-teal-50 border-2 border-teal-200 text-teal-600 hover:bg-teal-100 transition-colors cursor-pointer shrink-0"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
    </SettingsPanel>
  );
}
