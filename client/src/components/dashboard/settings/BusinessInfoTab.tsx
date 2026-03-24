import { useState, useEffect, useRef } from "react";
import { Globe, Building2, ImagePlus } from "lucide-react";
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

const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2 MB
const ACCEPTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];

export default function BusinessInfoTab({ onBack }: { onBack: () => void }) {
  const { profile, refresh } = useBusinessDashboard();
  const { updateProfile, saving } = useBusinessSettings();
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [logoBase64, setLogoBase64] = useState<string>("");
  const [logoError, setLogoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      // Initialize preview from existing logo
      if (profile.logoUrl && !logoBase64) {
        setLogoBase64(profile.logoUrl);
      }
    }
  }, [profile]);

  const update = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleLogoSelect = (file: File) => {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setLogoError("Please upload a PNG, JPG, WebP, or SVG image.");
      return;
    }
    if (file.size > MAX_LOGO_SIZE) {
      setLogoError("Image must be under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setLogoBase64(reader.result as string);
      setLogoError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (): Promise<boolean> => {
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
    if (Object.values(newErrors).some((e) => e !== undefined)) return false;

    // Include logoUrl only if it changed from the saved profile
    const payload: Record<string, string | null | boolean> = { ...form };
    if (logoBase64 && logoBase64 !== profile?.logoUrl) {
      payload.logoUrl = logoBase64;
    }

    const result = await updateProfile(payload);
    if (result?.success) {
      await refresh();
      return true;
    }
    return false;
  };

  const currentLogo = logoBase64 || profile?.logoUrl;

  return (
    <SettingsPanel
      title="Business Info"
      subtitle="Update your business details and contact information"
      onBack={onBack}
      onSave={handleSave}
      saving={saving}
    >
      {/* Logo Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-neutral-800 mb-2">
          Café Logo
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) handleLogoSelect(file);
          }}
          onDragOver={(e) => e.preventDefault()}
          className={`relative flex items-center gap-4 border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all ${
            logoError
              ? "border-red-300 bg-red-50/30"
              : currentLogo
                ? "border-teal-300 bg-teal-50/30"
                : "border-gray-200 hover:border-teal-300 hover:bg-teal-50/20"
          }`}
        >
          {currentLogo ? (
            <>
              <img
                src={currentLogo}
                alt="Café logo"
                className="w-16 h-16 rounded-xl object-cover border border-gray-200 shrink-0"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">{profile?.name}</p>
                <p className="text-xs text-teal-600 mt-0.5">Click or drag to replace logo</p>
                <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WebP, or SVG (max 2 MB)</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <ImagePlus size={22} className="text-gray-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Upload café logo</p>
                <p className="text-xs text-gray-400 mt-0.5">Click or drag and drop</p>
                <p className="text-xs text-gray-400">PNG, JPG, WebP, or SVG (max 2 MB)</p>
              </div>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleLogoSelect(file);
              e.target.value = "";
            }}
          />
        </div>
        {logoError && (
          <p className="text-xs text-red-500 mt-1.5">{logoError}</p>
        )}
      </div>

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
        <h3 className="text-base font-bold text-gray-900 mb-4">Business Address</h3>
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
