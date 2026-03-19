import { Globe } from "lucide-react";
import { Input } from "../../ui/Input";
import { SettingsPanel } from "./SettingsPanel";
import { SelectField } from "./SelectField";

export default function BusinessInfoTab({ onBack }: { onBack: () => void }) {
  return (
    <SettingsPanel
      title="Business Info"
      subtitle="Update your business details and contact information"
      onBack={onBack}
    >
      <div className="flex flex-col gap-5">
        <Input
          label="Email Address"
          type="email"
          placeholder="contact@yourbusiness.com"
        />
        <Input label="Contact Name" placeholder="contact@yourbusiness.com" />
        <Input
          label="Business Website"
          placeholder="https://www.yourbusiness.com/contact"
          rightIcon={<Globe size={16} />}
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
            value=""
            onChange={() => {}}
          />
          <Input
            label="Phone Number"
            type="tel"
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      {/* Business Address */}
      <div className="mt-8">
        <h3 className="text-base font-bold text-gray-900 mb-4">
          Business Address
        </h3>
        <div className="flex flex-col gap-4">
          <Input label="Street Address" placeholder="123 Main Street" />
          <div className="grid grid-cols-3 gap-4">
            <Input label="City" placeholder="City" />
            <Input label="Province" placeholder="Province" />
            <Input label="Postal Code" placeholder="Postal Code" />
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
          value=""
          onChange={() => {}}
        />
      </div>
    </SettingsPanel>
  );
}
