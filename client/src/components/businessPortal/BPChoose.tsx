import { Lock, Store, Shield, Clock, HeadphonesIcon, ChevronRight } from "lucide-react";

interface Props {
  onSignIn: () => void;
  onRequest: () => void;
}

export function BPChoose({ onSignIn, onRequest }: Props) {
  return (
    <div className="px-6 pt-6 pb-5 flex flex-col gap-5">
      <div>
        <h2 id="auth-step-heading" className="text-xl sm:text-2xl font-bold text-neutral-800">Welcome</h2>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
          Sign in to your dashboard or apply to become a Gatore partner.
        </p>
      </div>

      {/* Sign in option */}
      <button
        onClick={onSignIn}
        className="w-full flex items-center gap-4 p-4 bg-warm-50 border border-warm-200 rounded-xl hover:border-teal-300 hover:bg-teal-50/50 transition-all text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
      >
        <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shrink-0 group-hover:bg-teal-700 transition-colors">
          <Lock size={17} aria-hidden="true" className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm sm:text-base font-bold text-neutral-800 group-hover:text-teal-700 transition-colors">
            Sign in to my dashboard
          </p>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
            Already a partner? Sign in with your email.
          </p>
        </div>
        <ChevronRight size={18} aria-hidden="true" className="text-neutral-500 group-hover:text-teal-600 transition-colors shrink-0" />
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-warm-300" />
        <span className="text-sm text-neutral-600">or</span>
        <div className="flex-1 h-px bg-warm-300" />
      </div>

      {/* Request option */}
      <button
        onClick={onRequest}
        className="w-full flex items-center gap-4 p-4 bg-warm-50 border border-warm-200 rounded-xl hover:border-teal-300 hover:bg-teal-50/50 transition-all text-left group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2"
      >
        <div className="w-10 h-10 rounded-xl bg-[#f5ede0] group-hover:bg-[#e8d4c0] flex items-center justify-center shrink-0 transition-colors">
          <Store size={17} aria-hidden="true" className="text-[#a07850] group-hover:text-[#7a5a38] transition-colors" />
        </div>
        <div className="flex-1">
          <p className="text-sm sm:text-base font-bold text-neutral-800 group-hover:text-teal-700 transition-colors">
            Request partner access
          </p>
          <p className="text-xs sm:text-sm text-neutral-600 mt-0.5">
            New to Gatore? We'll review and activate your account.
          </p>
        </div>
        <ChevronRight size={18} aria-hidden="true" className="text-neutral-500 group-hover:text-teal-600 transition-colors shrink-0" />
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
            className="flex items-center gap-2 text-xs text-neutral-600"
          >
            <Icon size={14} aria-hidden="true" className="text-teal-600 shrink-0" />
            {text}
          </div>
        ))}
      </div>
    </div>
  );
}
