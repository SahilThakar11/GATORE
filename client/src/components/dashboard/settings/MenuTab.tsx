import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "../../ui/Input";
import { SettingsPanel } from "./SettingsPanel";

interface MenuItem {
  id: string;
  name: string;
  desc: string;
  price: string;
  category: string;
}

const MOCK_MENU: MenuItem[] = [
  { id: "1", name: "Capucino", desc: "Desciption for delicious drink", price: "3.50", category: "Drink" },
  { id: "2", name: "Espresso", desc: "Strong and rich coffee shot", price: "2.00", category: "Drink" },
  { id: "3", name: "Latte", desc: "Creamy coffee with steamed milk", price: "4.00", category: "Drink" },
  { id: "4", name: "Mocha", desc: "Chocolatey coffee treat", price: "4.50", category: "Drink" },
];

export default function MenuTab({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<MenuItem[]>(MOCK_MENU);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((i) => i.id !== id));

  const addItem = () => {
    if (!newName.trim()) return;
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newName,
        desc: newDesc,
        price: newPrice || "0.00",
        category: "Drink",
      },
    ]);
    setNewName("");
    setNewDesc("");
    setNewPrice("");
  };

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
              <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
              <p className="text-sm font-bold text-teal-600 mt-1">
                ${item.price}
              </p>
            </div>
            <button
              onClick={() => removeItem(item.id)}
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
          onClick={addItem}
          className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm font-medium text-teal-600 hover:border-teal-300 hover:bg-teal-50/50 transition-all cursor-pointer"
        >
          <Plus size={15} />
          Add Item
        </button>
      </div>
    </SettingsPanel>
  );
}
