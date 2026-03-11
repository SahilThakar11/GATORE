import { Lock, Star, Shield, Clock, HeadphonesIcon } from "lucide-react";
import { Button } from "../ui/Button";

interface Props {
  onSignIn: () => void;
  onRequest: () => void;
}

export function BPChoose({ onSignIn, onRequest }: Props) {
  return (
    <div className="px-6 pt-6 pb-5 flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-black text-gray-900">Welcome</h2>
        <p className="text-sm text-gray-500 mt-1">
          Sign in to your dashboard or apply to become a Gatore partner.
        </p>
      </div>

      {/* Sign in option */}
      <button
        onClick={onSignIn}
        className="w-full flex items-center gap-4 p-4 bg-[#faf8f4] border border-gray-100 rounded-xl hover:border-teal-300 hover:bg-teal-50/50 transition-all text-left group"
      >
        <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shrink-0 group-hover:bg-teal-700 transition-colors">
          <Lock size={17} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900 group-hover:text-teal-700 transition-colors">
            Sign in to my dashboard
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Already a partner? Sign in with your email.
          </p>
        </div>
        <span className="text-gray-300 group-hover:text-teal-400 transition-colors text-xl leading-none">
          ›
        </span>
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400">or</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Request option */}
      <button
        onClick={onRequest}
        className="w-full flex items-center gap-4 p-4 bg-[#faf8f4] border border-gray-100 rounded-xl hover:border-amber-200 hover:bg-[#fdf8f0] transition-all text-left group"
      >
        <div className="w-10 h-10 rounded-xl bg-[#f5ede0] flex items-center justify-center shrink-0">
          <Star size={17} className="text-[#a07850]" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-gray-900 group-hover:text-amber-800 transition-colors">
            Request partner access
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            New to Gatore? We'll review and activate your account.
          </p>
        </div>
        <span className="text-gray-300 group-hover:text-amber-400 transition-colors text-xl leading-none">
          ›
        </span>
      </button>

      {/* Trust row */}
      <div className="flex flex-col gap-2 pt-1">
        {[
          { icon: Shield, text: "Secure OTP login — no password stored" },
          { icon: Clock, text: "Account activated within 48 hours" },
          { icon: HeadphonesIcon, text: "Dedicated partner support included" },
        ].map(({ icon: Icon, text }) => (
          <div
            key={text}
            className="flex items-center gap-2 text-xs text-gray-400"
          >
            <Icon size={12} className="text-teal-500 shrink-0" />
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}
