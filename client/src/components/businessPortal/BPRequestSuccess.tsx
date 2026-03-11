import { CheckCircle } from "lucide-react";
import { Button } from "../ui/Button";

interface Props {
  cafeName: string;
  email: string;
  onReset: () => void;
  onClose: () => void;
}

export function BPRequestSuccess({ cafeName, email, onReset, onClose }: Props) {
  return (
    <div className="px-6 pt-8 pb-6 flex flex-col items-center text-center gap-5">
      <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center">
        <div className="w-11 h-11 rounded-full bg-teal-600 flex items-center justify-center">
          <CheckCircle size={22} className="text-white" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-black text-gray-900">Request received!</h2>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed max-w-xs">
          Thanks for reaching out. Our team will review your application and
          email you within <strong className="text-gray-700">48 hours</strong>.
        </p>
      </div>

      <div className="w-full bg-[#faf8f4] border border-gray-100 rounded-xl px-5 py-4 text-left">
        <p className="text-xs text-gray-400">Submitted for</p>
        <p className="text-sm font-bold text-gray-800 mt-0.5">{cafeName}</p>
        <p className="text-xs text-gray-500">{email}</p>
      </div>

      <div className="flex flex-col gap-2 w-full pt-1">
        <Button variant="primary" fullWidth onClick={onClose}>
          Done
        </Button>
        <button
          onClick={onReset}
          className="text-xs text-gray-400 hover:text-teal-600 transition-colors py-1"
        >
          Submit another request
        </button>
      </div>
    </div>
  );
}
