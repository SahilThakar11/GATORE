import { Check, Store, Mail } from "lucide-react";
import { PrimaryButton } from "../ui/PrimaryButton";
import { TextButton } from "../ui/TextButton";

interface Props {
  cafeName: string;
  email: string;
  onReset: () => void;
  onClose: () => void;
}

export function BPRequestSuccess({ cafeName, email, onReset, onClose }: Props) {
  return (
    <div className="px-5 pt-6 pb-4 flex flex-col items-center text-center gap-5 flex-1">
      <div className="flex flex-col items-center gap-2 pt-2">
        <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center">
            <Check size={22} strokeWidth={3} aria-hidden="true" className="text-white" />
          </div>
        </div>
        <h2 id="auth-step-heading" className="text-xl sm:text-2xl font-bold text-neutral-800">Request received!</h2>
        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-xs">
          Thanks for reaching out. Our team will review your application and
          email you within <strong className="text-neutral-700">48 hours</strong>.
        </p>
      </div>

      <div className="w-full bg-warm-50 border border-warm-200 rounded-xl px-5 py-4 text-left">
        <p className="text-xs text-neutral-600 mb-3">Submitted for</p>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[#f5ede0] flex items-center justify-center shrink-0">
            <Store size={20} aria-hidden="true" className="text-[#a07850]" />
          </div>
          <div>
            <p className="text-base font-bold text-neutral-800">{cafeName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Mail size={13} aria-hidden="true" className="text-neutral-500" />
              <span className="text-sm text-neutral-600">{email}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 w-full pt-1">
        <div className="[&>button]:w-full">
          <PrimaryButton label="Done" onClick={onClose} />
        </div>
        <TextButton label="Submit another request" onClick={onReset} size="small" />
      </div>
    </div>
  );
}
