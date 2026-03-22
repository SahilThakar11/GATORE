import { useState } from "react";
import { Clock, DollarSign, Plus, Check, Info } from "lucide-react";
import { Input } from "../../ui/Input";
import { SettingsPanel } from "./SettingsPanel";

export default function PricingTab({ onBack }: { onBack: () => void }) {
  const [pricingType, setPricingType] = useState("hourly");
  const [enableThreshold, setEnableThreshold] = useState(true);

  const pricingOptions = [
    {
      key: "hourly",
      icon: Clock,
      title: "Hourly Rate",
      desc: "Charge customers based on how long they play",
    },
    {
      key: "flat",
      icon: DollarSign,
      title: "Flat Cover Fee",
      desc: "One-time fee per person, unlimited play time",
    },
    {
      key: "hybrid",
      icon: Plus,
      title: "Hybrid",
      desc: "Combine cover fee with hourly rate",
    },
  ];

  return (
    <SettingsPanel
      title="Pricing Model"
      subtitle="Choose how you want to charge customers for table reservations"
      onBack={onBack}
    >
      {/* Pricing Type */}
      <h3 className="text-sm font-bold text-gray-900 mb-3">Pricing Type</h3>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {pricingOptions.map((opt) => {
          const Icon = opt.icon;
          const active = pricingType === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => setPricingType(opt.key)}
              className={`flex flex-col items-start gap-2 p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                active
                  ? "border-teal-500 bg-teal-50/60"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  active ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-500"
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

      {/* Body: Preview + Controls */}
      <div className="grid grid-cols-2 gap-6">
        {/* Customer Preview */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-3">
            Customer Preview
          </h3>
          <div className="border border-gray-200 rounded-xl p-5">
            <p className="text-sm font-bold text-gray-900">Table Pricing</p>
            <p className="text-xs text-gray-400 mb-3">
              Per hour of play time
            </p>
            <p className="text-2xl font-black text-gray-900 mb-3">
              $8.00
              <span className="text-sm font-normal text-gray-400">/hour</span>
            </p>
            <div className="flex flex-col gap-1 text-xs text-gray-500">
              <span>✓ 1 hour: $8.00</span>
              <span>✓ 2 hours: $16.00</span>
              <span>✓ 3 hours: $24.00</span>
              <span className="text-teal-600 font-medium">
                ✓ Free with $15.00+ purchase
              </span>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 mt-2 leading-snug">
            This is how your pricing will appear to customers when they make a
            reservation.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4">
          <Input label="Hourly Rate" placeholder="$ 8.00" />
          <p className="text-[11px] text-gray-400 -mt-2">
            Amount charged per hour of play time
          </p>

          {/* Threshold checkbox */}
          <label className="flex items-center gap-2 cursor-pointer">
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
              <Input label="Minimum Spend Amount" placeholder="$ 15.00" />
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 flex gap-2">
                <Info size={14} className="text-teal-600 shrink-0 mt-0.5" />
                <p className="text-xs text-teal-700 leading-snug">
                  If customers spend{" "}
                  <span className="font-bold underline">$15.00</span> or more on
                  food/drinks, the table fee will be waived automatically.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </SettingsPanel>
  );
}
