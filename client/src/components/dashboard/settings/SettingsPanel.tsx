import { ArrowLeft, Save } from "lucide-react";
import { Button } from "../../ui/Button";

export function SettingsPanel({
  title,
  subtitle,
  onBack,
  children,
}: {
  title: string;
  subtitle: string;
  onBack: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-7">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
            </div>
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-800 transition-colors cursor-pointer"
            >
              <ArrowLeft size={15} />
              Back
            </button>
          </div>

          {/* Panel body */}
          {children}
        </div>
      </div>

      {/* Sticky footer */}
      <div className="pt-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">
            Happy with your changes?
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="flex gap-3">
          <Button variant="outline" fullWidth onClick={onBack}>
            Cancel
          </Button>
          <Button variant="primary" fullWidth>
            <span className="flex items-center justify-center gap-2">
              <Save size={15} />
              Save Changes
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
