import { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import { Input } from "../../ui/Input";
import { SettingsPanel } from "./SettingsPanel";
import { SelectField } from "./SelectField";
import { useBusinessSettings } from "../../../hooks/useBusinessSettings";
import { useBusinessDashboard } from "../../../hooks/useBusinessDashboard";
import {
  validateEmail,
  validatePhone,
  validateUrl,
  validatePostalCode,
  validateRequired,
} from "../../../utils/validations";

export default function BusinessInfoTab({ onBack }: { onBack: () => void }) {
  const { profile } = useBusinessDashboard();
  const { updateProfile, saving } = useBusinessSettings();
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const [form, setForm] = useState({
    contactEmail: "",
    contactName: "",
    website: "",
    businessType: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postalCode: "",
    timezone: "",
  });

  useEffect(() => {
    if (profile) {
      setForm({
        contactEmail: profile.contactEmail || "",
        contactName: profile.contactName || "",
        website: profile.website || "",
        businessType: profile.businessType || "",
        phone: profile.phone || "",
        address: profile.address || "",
        city: profile.city || "",
        province: profile.province || "",
        postalCode: profile.postalCode || "",
        timezone: profile.timezone || "EST (Eastern)",
      });
    }
  }, [profile]);

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSave = async () => {
    const newErrors: Record<string, string | undefined> = {
      contactEmail: validateEmail(form.contactEmail) ?? undefined,
      contactName: validateRequired(form.contactName) ?? undefined,
      website: validateUrl(form.website) ?? undefined,
      phone: validatePhone(form.phone) ?? undefined,
      address: validateRequired(form.address) ?? undefined,
      city: validateRequired(form.city) ?? undefined,
      province: validateRequired(form.province) ?? undefined,
      postalCode: validatePostalCode(form.postalCode) ?? undefined,
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some((e) => e !== undefined)) return;
    await updateProfile(form);
  };

  return (
    <SettingsPanel
      title="Business Info"
      subtitle="Update your business details and contact information"
      onBack={onBack}
      onSave={handleSave}
      saving={saving}
    >
      <div className="flex flex-col gap-5">
        <Input
          label="Email Address"
          type="email"
          placeholder="contact@yourbusiness.com"
          value={form.contactEmail}
          onChange={update("contactEmail")}
          error={errors.contactEmail}
        />
        <Input
          label="Contact Name"
          placeholder="Your name"
          value={form.contactName}
          onChange={update("contactName")}
          error={errors.contactName}
        />
        <Input
          label="Business Website"
          placeholder="https://www.yourbusiness.com/contact"
          rightIcon={<Globe size={16} />}
          value={form.website}
          onChange={update("website")}
          error={errors.website}
        />

        <div className="grid grid-cols-2 gap-4">
          <SelectField
            label="Business Type"
            options={[
              "Board Game Café",
              "Restaurant",
              "Bar",
              "Lounge",
              "Other",
            ]}
            value={form.businessType}
            onChange={(v) => setForm((prev) => ({ ...prev, businessType: v }))}
          />
          <Input
            label="Phone Number"
            type="tel"
            placeholder="(555) 123-4567"
            value={form.phone}
            onChange={update("phone")}
            error={errors.phone}
          />
        </div>
      </div>

      {/* Business Address */}
      <div className="mt-8">
        <h3 className="text-base font-bold text-gray-900 mb-4">
          Business Address
        </h3>
        <div className="flex flex-col gap-4">
          <Input label="Street Address" placeholder="123 Main Street" value={form.address} onChange={update("address")} error={errors.address} />
          <div className="grid grid-cols-3 gap-4">
            <Input label="City" placeholder="City" value={form.city} onChange={update("city")} error={errors.city} />
            <Input label="Province" placeholder="Province" value={form.province} onChange={update("province")} error={errors.province} />
            <Input label="Postal Code" placeholder="Postal Code" value={form.postalCode} onChange={update("postalCode")} error={errors.postalCode} />
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="mt-8">
        <h3 className="text-base font-bold text-gray-900 mb-4">Preferences</h3>
        <SelectField
          label="Timezone"
          options={[
            "EST (Eastern)",
            "CST (Central)",
            "MST (Mountain)",
            "PST (Pacific)",
          ]}
          value={form.timezone}
          onChange={(v) => setForm((prev) => ({ ...prev, timezone: v }))}
        />
      </div>
    </SettingsPanel>
  );
}
