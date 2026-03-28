import { useState, useEffect } from "react";
import { Clock, CreditCard, Zap, Check, Loader2 } from "lucide-react";
import { Input } from "../../ui/Input";
import { AlertBanner } from "../../ui/AlertBanner";
import { SettingsPanel } from "./SettingsPanel";
import {
  useBusinessSettings,
  type PricingConfig,
} from "../../../hooks/useBusinessSettings";
import { validatePositiveNumber } from "../../../utils/validations";

export default function PricingTab({ onBack }: { onBack: () => void }) {
  const { fetchPricing, updatePricing, saving } = useBusinessSettings();
  const [pricingType, setPricingType] = useState("hourly");
  const [hourlyRate, setHourlyRate] = useState("8.00");
  const [coverFee, setCoverFee] = useState("5.00");
  const [minSpend, setMinSpend] = useState("15.00");
  const [enableThreshold, setEnableThreshold] = useState(true);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    fetchPricing().then((data: PricingConfig | null) => {
      if (data) {
        setPricingType(data.pricingType || "hourly");
        setHourlyRate(data.hourlyRate || "8.00");
        setCoverFee(data.coverFee || "5.00");
        setMinSpend(data.minSpend || "15.00");
        setEnableThreshold(data.enableThreshold ?? true);
      }
      setLoading(false);
    });
  }, [fetchPricing]);

  const handleSave = async (): Promise<boolean> => {
    const newErrors: Record<string, string | undefined> = {};
    if (pricingType === "hourly" || pricingType === "hybrid") {
      newErrors.hourlyRate =
        validatePositiveNumber(hourlyRate, "Hourly Rate") ?? undefined;
    }
    if (pricingType === "flat" || pricingType === "hybrid") {
      newErrors.coverFee =
        validatePositiveNumber(coverFee, "Cover Fee") ?? undefined;
    }
    if (enableThreshold) {
      newErrors.minSpend =
        validatePositiveNumber(minSpend, "Minimum Spend") ?? undefined;
    }
    setErrors(newErrors);
    if (Object.values(newErrors).some((e) => e !== undefined)) return false;

    const result = await updatePricing({
      pricingType,
      hourlyRate: pricingType === "flat" ? null : hourlyRate,
      coverFee: pricingType === "hourly" ? null : coverFee,
      minSpend: enableThreshold ? minSpend : null,
      enableThreshold,
    });
    return result?.success ?? false;
  };

  const pricingOptions = [
    {
      key: "hourly",
      icon: Clock,
      title: "Hourly Rate",
      desc: "Charge customers based on how long they play",
    },
    {
      key: "flat",
      icon: CreditCard,
      title: "Flat Cover Fee",
      desc: "One-time fee per person, unlimited play time",
    },
    {
      key: "hybrid",
      icon: Zap,
      title: "Hybrid",
      desc: "Combine cover fee with hourly rate",
    },
  ];

  const rate = parseFloat(hourlyRate) || 0;
  const cover = parseFloat(coverFee) || 0;
  const spend = parseFloat(minSpend) || 0;

  if (loading) {
    return (
      <SettingsPanel
        title="Pricing Model"
        subtitle="Configure pricing"
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
      title="Pricing Model"
      subtitle="Choose how you want to charge customers for table reservations"
      onBack={onBack}
      onSave={handleSave}
      saving={saving}
    >
      {/* Pricing type cards — full width, 3 columns */}
      <h3 className="text-sm font-bold text-neutral-800 mb-3">
        Pricing Type
      </h3>
      <div className="grid grid-cols-3 gap-3 mb-7">
        {pricingOptions.map((opt) => {
          const Icon = opt.icon;
          const active = pricingType === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => {
                setPricingType(opt.key);
                setErrors({});
              }}
              aria-pressed={active}
              className={`flex items-start gap-3 p-4 rounded-xl border text-left transition-all cursor-pointer ${
                active
                  ? "border-teal-500 bg-warm-100 shadow-sm"
                  : "border-warm-300 bg-warm-50 hover:border-warm-400 hover:bg-warm-100"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                  active
                    ? "bg-teal-700 text-white border-teal-600"
                    : "bg-teal-50 text-teal-700 border-teal-200"
                }`}
              >
                <Icon size={18} aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-800 flex items-center gap-1.5">
                  {opt.title}
                  {active && (
                    <Check
                      size={14}
                      className="text-teal-700"
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                  )}
                </p>
                <p className="text-xs text-neutral-600 mt-0.5 leading-tight">
                  {opt.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom section: preview left, controls right */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left: Customer Preview */}
        <div>
          <h3 className="text-sm font-bold text-neutral-800 mb-3">
            Customer Preview
          </h3>
          <div className="border border-warm-300 rounded-xl p-5 shadow-sm bg-white">
            <p className="text-base font-bold text-neutral-800">
              Table Pricing
            </p>
            <p className="text-sm text-neutral-600 mb-4">
              {pricingType === "flat"
                ? "Per person, unlimited play time"
                : pricingType === "hybrid"
                  ? "Cover fee + hourly rate"
                  : "Per hour of play time"}
            </p>
            <hr className="mb-4 border-warm-200" />

            {pricingType === "flat" ? (
              <>
                <p className="text-2xl font-black text-neutral-800 mb-4">
                  ${cover.toFixed(2)}
                  <span className="text-sm font-normal text-neutral-600">
                    /person
                  </span>
                </p>
                <div className="flex flex-col gap-2 text-sm text-neutral-600">
                  <span className="flex items-center gap-1.5">
                    <Check
                      size={12}
                      className="text-teal-700 shrink-0"
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                    One-time cover fee per person
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check
                      size={12}
                      className="text-teal-700 shrink-0"
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                    Unlimited play time included
                  </span>
                  {enableThreshold && (
                    <span className="flex items-center gap-1.5 text-teal-700 font-medium">
                      <Check size={12} className="shrink-0" strokeWidth={3} aria-hidden="true" />
                      Waived with ${spend.toFixed(2)}+ purchase
                    </span>
                  )}
                </div>
              </>
            ) : pricingType === "hybrid" ? (
              <>
                <p className="text-2xl font-black text-neutral-800 mb-4">
                  ${cover.toFixed(2)}
                  <span className="text-sm font-normal text-neutral-600">
                    /person
                  </span>
                  <span className="text-base font-normal text-neutral-500 ml-2">
                    + ${rate.toFixed(2)}/hr
                  </span>
                </p>
                <div className="flex flex-col gap-2 text-sm text-neutral-600">
                  <span className="flex items-center gap-1.5">
                    <Check
                      size={12}
                      className="text-teal-700 shrink-0"
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                    Cover fee: ${cover.toFixed(2)} per person
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check
                      size={12}
                      className="text-teal-700 shrink-0"
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                    + ${rate.toFixed(2)}/hour at the table
                  </span>
                  {enableThreshold && (
                    <span className="flex items-center gap-1.5 text-teal-700 font-medium">
                      <Check size={12} className="shrink-0" strokeWidth={3} aria-hidden="true" />
                      Hourly waived with ${spend.toFixed(2)}+ purchase
                    </span>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="text-2xl font-black text-neutral-800 mb-4">
                  ${rate.toFixed(2)}
                  <span className="text-sm font-normal text-neutral-600 ml-1">
                    /hour
                  </span>
                </p>
                <div className="flex flex-col gap-2 text-sm text-neutral-600">
                  <span className="flex items-center gap-1.5">
                    <Check
                      size={12}
                      className="text-teal-700 shrink-0"
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                    1 hour: ${rate.toFixed(2)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check
                      size={12}
                      className="text-teal-700 shrink-0"
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                    2 hours: ${(rate * 2).toFixed(2)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Check
                      size={12}
                      className="text-teal-700 shrink-0"
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                    3 hours: ${(rate * 3).toFixed(2)}
                  </span>
                  {enableThreshold && (
                    <span className="flex items-center gap-1.5 text-teal-700 font-medium">
                      <Check size={12} className="shrink-0" strokeWidth={3} aria-hidden="true" />
                      Free with ${spend.toFixed(2)}+ purchase
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="mt-3">
            <AlertBanner
              variant="info"
              title="This is how your pricing will appear to customers when they make a reservation."
            />
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex flex-col gap-4">
          {(pricingType === "flat" || pricingType === "hybrid") && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-800">
                  Cover Fee (per person)
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-neutral-500">
                    $
                  </span>
                  <div className="flex-1">
                    <Input
                      placeholder="5.00"
                      value={coverFee}
                      onChange={(e) => {
                        setCoverFee(e.target.value);
                        setErrors((p) => ({ ...p, coverFee: undefined }));
                      }}
                      error={errors.coverFee}
                    />
                  </div>
                </div>
                <p className="text-xs text-neutral-600">
                  One-time fee charged per person at the time of reservation
                </p>
              </div>
            </>
          )}

          {(pricingType === "hourly" || pricingType === "hybrid") && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-800">
                  Hourly Rate
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-neutral-500">
                    $
                  </span>
                  <div className="flex-1">
                    <Input
                      placeholder="8.00"
                      value={hourlyRate}
                      onChange={(e) => {
                        setHourlyRate(e.target.value);
                        setErrors((p) => ({ ...p, hourlyRate: undefined }));
                      }}
                      error={errors.hourlyRate}
                    />
                  </div>
                </div>
                <p className="text-xs text-neutral-600">
                  Amount charged per hour of play time
                </p>
              </div>
            </>
          )}

          {/* Threshold checkbox */}
          <label className="flex items-center gap-2 cursor-pointer mt-1">
            <button
              onClick={() => setEnableThreshold((v) => !v)}
              aria-pressed={enableThreshold}
              aria-label={`${enableThreshold ? "Disable" : "Enable"} spending threshold`}
              className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors shrink-0 ${
                enableThreshold
                  ? "bg-teal-600 border-teal-600"
                  : "border-warm-300"
              }`}
            >
              {enableThreshold && (
                <Check size={13} className="text-white" strokeWidth={3} aria-hidden="true" />
              )}
            </button>
            <span className="text-sm font-medium text-neutral-800">
              Enable spending threshold
            </span>
          </label>

          {enableThreshold && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-800">
                  Minimum Spend Amount
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-medium text-neutral-500">
                    $
                  </span>
                  <div className="flex-1">
                    <Input
                      placeholder="15.00"
                      value={minSpend}
                      onChange={(e) => {
                        setMinSpend(e.target.value);
                        setErrors((p) => ({ ...p, minSpend: undefined }));
                      }}
                      error={errors.minSpend}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </SettingsPanel>
  );
}
