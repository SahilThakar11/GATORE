import { useState, useEffect } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import { Input } from "../../ui/Input";
import { SettingsPanel } from "./SettingsPanel";
import { useBusinessSettings, type MenuItem } from "../../../hooks/useBusinessSettings";

export default function MenuTab({ onBack }: { onBack: () => void }) {
  const { fetchMenu, addMenuItem, removeMenuItem } = useBusinessSettings();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenu().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, [fetchMenu]);

  const handleRemove = async (id: number) => {
    const result = await removeMenuItem(id);
    if (result.success) setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const result = await addMenuItem({
      name: newName,
      description: newDesc || undefined,
      price: newPrice || "0.00",
      category: "Drink",
    });
    if (result.success) {
      setItems((prev) => [...prev, result.data]);
      setNewName("");
      setNewDesc("");
      setNewPrice("");
    }
  };

  if (loading) {
    return (
      <SettingsPanel title="Menu" subtitle="Manage your menu items" onBack={onBack}>
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-teal-600" />
        </div>
      </SettingsPanel>
    );
  }

  return (
    <SettingsPanel
      title="Menu"
      subtitle="Customize your menu so customers can browse while making reservations."
      onBack={onBack}
    >
      {/* Items list */}
      <h3 className="text-sm font-bold text-gray-900 mb-3">
        Menu Items ({items.length})
      </h3>
      <div className="flex flex-col gap-3 mb-6">
        {items.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">
            No menu items yet. Add some below!
          </p>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between border border-gray-200 rounded-xl p-4"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-gray-900">{item.name}</p>
                <span className="text-[10px] bg-warm-200 text-warm-700 px-2 py-0.5 rounded-full font-semibold">
                  {item.category}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{item.description || ""}</p>
              <p className="text-sm font-bold text-teal-600 mt-1">
                ${parseFloat(item.price).toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => handleRemove(item.id)}
              className="text-gray-300 hover:text-red-400 transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* Add form */}
      <h3 className="text-sm font-bold text-gray-900 mb-3">Add Menu Items</h3>
      <div className="border border-gray-200 rounded-xl p-5 flex flex-col gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-800">
            Description (Optional)
          </label>
          <textarea
            placeholder="e.g., Espresso with steamed milk"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            rows={2}
            className="w-full px-4 py-3 border border-warm-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 outline-none transition-colors focus:ring-2 focus:ring-teal-500 resize-none"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Item Name"
            placeholder="e.g., Cappuccino"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Input
            label="Price"
            placeholder="5.00"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
          />
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-teal-600 hover:border-teal-300 hover:bg-teal-50/50 transition-all cursor-pointer"
        >
          <Plus size={15} />
          Add Item
        </button>
      </div>
    </SettingsPanel>
  );
}
