import {
  Mail,
  Phone,
  MapPin,
  User,
  Store,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import { Input } from "../ui/Input";
import { PrimaryButton } from "../ui/PrimaryButton";
import { SecondaryButton } from "../ui/SecondaryButton";

interface RequestForm {
  cafeName: string;
  ownerName: string;
  email: string;
  phone: string;
  city: string;
  message: string;
}

interface Props {
  onSubmit: (form: RequestForm) => void;
  onBack: () => void;
  loading: boolean;
}

export function BPRequestAccess({ onSubmit, onBack, loading }: Props) {
  const [form, setForm] = useState<RequestForm>({
    cafeName: "",
    ownerName: "",
    email: "",
    phone: "",
    city: "",
    message: "",
  });

  const set =
    (key: keyof RequestForm) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const isValid = form.cafeName && form.ownerName && form.email && form.city;

  return (
    <div className="px-5 pt-5 pb-4 flex flex-col gap-5 flex-1">
      <div>
        <h2 id="auth-step-heading" className="text-xl sm:text-2xl font-bold text-neutral-800">Request access</h2>
        <p className="text-xs sm:text-sm text-neutral-600 mt-1">
          Tell us about your café. We'll review and activate your account within
          48 hours.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={<>Café name <span aria-hidden="true">*</span></>}
            placeholder="The Board Room"
            value={form.cafeName}
            onChange={set("cafeName")}
            leftIcon={<Store size={16} aria-hidden="true" />}
            aria-required="true"
          />
          <Input
            label={<>Your name <span aria-hidden="true">*</span></>}
            placeholder="Jane Smith"
            value={form.ownerName}
            onChange={set("ownerName")}
            leftIcon={<User size={16} aria-hidden="true" />}
            aria-required="true"
          />
        </div>

        <Input
          label={<>Business email <span aria-hidden="true">*</span></>}
          type="email"
          placeholder="owner@yourcafe.com"
          value={form.email}
          onChange={set("email")}
          leftIcon={<Mail size={16} aria-hidden="true" />}
          aria-required="true"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Phone"
            type="tel"
            placeholder="(519) 000-0000"
            value={form.phone}
            onChange={set("phone")}
            leftIcon={<Phone size={16} aria-hidden="true" />}
          />
          <Input
            label={<>City <span aria-hidden="true">*</span></>}
            placeholder="Waterloo, ON"
            value={form.city}
            onChange={set("city")}
            leftIcon={<MapPin size={16} aria-hidden="true" />}
            aria-required="true"
          />
        </div>

        {/* Textarea */}
        <div className="space-y-2">
          <label htmlFor="cafe-message" className="block text-xs sm:text-sm font-medium text-neutral-800">
            Tell us about your café
          </label>
          <textarea
            id="cafe-message"
            rows={3}
            placeholder="How many games do you have? What makes your café special?"
            value={form.message}
            onChange={set("message")}
            className="w-full px-4 py-3 border border-warm-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm sm:text-base resize-none bg-warm-50"
          />
        </div>
      </div>

      <p className="text-xs text-neutral-600 text-center">
        We review all requests within{" "}
        <strong className="text-neutral-700">48 hours</strong>
      </p>

      <div className="mt-auto flex gap-3 bg-warm-50 px-4 py-4 border border-warm-200 -mx-5 -mb-4">
        <div className="flex-1 [&>button]:w-full">
          <SecondaryButton label="Back" onClick={onBack} disabled={loading} leftIcon={<ChevronLeft size={16} aria-hidden="true" />} />
        </div>
        <div className="flex-1 [&>button]:w-full">
          <PrimaryButton
            label={loading ? "Submitting…" : "Request Access"}
            onClick={() => onSubmit(form)}
            disabled={!isValid || loading}
            isLoading={loading}
            rightIcon={!loading ? <ChevronRight size={16} aria-hidden="true" /> : undefined}
          />
        </div>
      </div>
    </div>
  );
}
