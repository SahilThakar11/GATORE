import { useState, useEffect } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import { Input } from "../../ui/Input";
import { SettingsPanel } from "./SettingsPanel";
import { SecondaryButton } from "../../ui/SecondaryButton";
import { SelectField } from "./SelectField";
import {
  useBusinessSettings,
  type MenuItem,
} from "../../../hooks/useBusinessSettings";

const MENU_CATEGORIES = ["Drink", "Food", "Snack", "Dessert", "Other"];

export default function MenuTab({ onBack }: { onBack: () => void }) {
  const { fetchMenu, addMenuItem, removeMenuItem, saving } = useBusinessSettings();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [newCategory, setNewCategory] = useState("Drink");
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [nameError, setNameError] = useState("");

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
    if (!newName.trim()) {
      setNameError("Item name is required.");
      return;
    }
    setNameError("");
    setAdding(true);
    try {
      const result = await addMenuItem({
        name: newName,
        description: newDesc || undefined,
        price: newPrice || "0.00",
        category: newCategory,
      });
      if (result.success) {
        setItems((prev) => [...prev, result.data]);
        setNewName("");
        setNewDesc("");
        setNewPrice("");
        setNewCategory("Drink");
      }
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <SettingsPanel
        title="Menu"
        subtitle="Manage your menu items"
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
      title="Menu"
      subtitle="Customize your menu so customers can browse while making reservations."
      onBack={onBack}
      onSave={async () => true}
      saving={saving}
    >
      {/* Items list */}
      <h3 className="text-sm font-bold text-neutral-800 mb-3">
        Menu Items ({items.length})
      </h3>
      <div className="flex flex-col gap-3 mb-6">
        {items.length === 0 && (
          <p className="text-sm text-neutral-500 text-center py-4">
            No menu items yet. Add some below!
          </p>
        )}
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start justify-between border border-warm-200 rounded-xl p-4 bg-warm-50"
          >
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-neutral-800">
                  {item.name}
                </p>
                <span className="text-[10px] bg-warm-200 text-warm-700 px-2 py-0.5 rounded-full font-semibold">
                  {item.category}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                {item.description || ""}
              </p>
              <p className="text-sm font-bold text-teal-600 mt-1">
                ${parseFloat(item.price).toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => handleRemove(item.id)}
              aria-label={`Remove ${item.name}`}
              className="text-gray-500 hover:text-red-400 transition-colors cursor-pointer"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>

      {/* Add form */}
      <h3 className="text-sm font-bold text-neutral-800 mb-3">
        Add Menu Items
      </h3>
      <div className="border border-warm-200 rounded-xl p-5 bg-warm-50 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Item Name"
            placeholder="e.g., Cappuccino"
            value={newName}
            onChange={(e) => { setNewName(e.target.value); setNameError(""); }}
            emptyBg="bg-white"
            error={nameError}
          />
          <div className="space-y-2">
            <label htmlFor="menu-price" className="block text-sm font-medium text-neutral-800">
              Price
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-neutral-500">$</span>
              <div className="flex-1">
                <Input
                  id="menu-price"
                  placeholder="5.00"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  emptyBg="bg-white"
                />
              </div>
            </div>
          </div>
        </div>
        <SelectField
          label="Category"
          options={MENU_CATEGORIES}
          value={newCategory}
          onChange={setNewCategory}
          triggerClassName="bg-white"
        />
        <div className="space-y-2">
          <label htmlFor="menu-description" className="block text-sm font-medium text-neutral-800">
            Description (Optional)
          </label>
          <textarea
            id="menu-description"
            placeholder="e.g., Espresso with steamed milk"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            rows={2}
            className="w-full px-4 py-3 border border-warm-300 rounded-lg text-sm text-neutral-700 placeholder:text-neutral-500 outline-none transition-colors focus:ring-2 focus:ring-teal-500 resize-none bg-white"
          />
        </div>
        <div className="[&>button]:w-full">
          <SecondaryButton
            label={adding ? "Adding..." : "Add Item"}
            onClick={handleAdd}
            disabled={adding}
            leftIcon={adding ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} aria-hidden="true" />}
          />
        </div>
      </div>
    </SettingsPanel>
  );
}
