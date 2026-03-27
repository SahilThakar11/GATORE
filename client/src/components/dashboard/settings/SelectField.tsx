import { Dropdown } from "../../ui/Dropdown";

export function SelectField({
  label,
  options,
  value,
  onChange,
  dropUp = false,
  triggerClassName,
}: {
  label?: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  dropUp?: boolean;
  triggerClassName?: string;
}) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-neutral-800">
          {label}
        </label>
      )}
      <Dropdown
        trigger="label"
        triggerLabel={value || "Select..."}
        isPlaceholder={!value}
        fullWidth
        dropUp={dropUp}
        triggerClassName={triggerClassName}
        items={options.map((opt) => ({ label: opt, onClick: () => onChange(opt) }))}
      />
    </div>
  );
}
