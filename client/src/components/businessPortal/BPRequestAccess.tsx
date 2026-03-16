import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  User,
  Store,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

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
        <h2 className="text-2xl font-bold text-gray-900">Request access</h2>
        <p className="text-sm text-gray-500 mt-1">
          Tell us about your café. We'll review and activate your account within
          48 hours.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Café name *"
            placeholder="The Board Room"
            value={form.cafeName}
            onChange={set("cafeName")}
            leftIcon={<Store size={15} />}
          />
          <Input
            label="Your name *"
            placeholder="Jane Smith"
            value={form.ownerName}
            onChange={set("ownerName")}
            leftIcon={<User size={15} />}
          />
        </div>

        <Input
          label="Business email *"
          type="email"
          placeholder="owner@yourcafe.com"
          value={form.email}
          onChange={set("email")}
          leftIcon={<Mail size={15} />}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Phone"
            type="tel"
            placeholder="(519) 000-0000"
            value={form.phone}
            onChange={set("phone")}
            leftIcon={<Phone size={15} />}
          />
          <Input
            label="City *"
            placeholder="Waterloo, ON"
            value={form.city}
            onChange={set("city")}
            leftIcon={<MapPin size={15} />}
          />
        </div>

        {/* Textarea */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-neutral-800">
            Tell us about your café
          </label>
          <div className="relative">
            <MessageSquare
              size={15}
              className="absolute left-3 top-3.5 text-neutral-400"
            />
            <textarea
              rows={3}
              placeholder="How many games do you have? What makes your café special?"
              value={form.message}
              onChange={set("message")}
              className="w-full pl-10 pr-4 py-3 border border-warm-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm resize-none bg-white"
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        We review all requests within{" "}
        <strong className="text-gray-600">48 hours</strong>
      </p>

      <div className="mt-auto flex gap-3">
        <Button variant="outline" fullWidth onClick={onBack} disabled={loading}>
          Back
        </Button>
        <Button
          variant="primary"
          fullWidth
          disabled={!isValid || loading}
          onClick={() => onSubmit(form)}
        >
          <span className="flex items-center justify-center gap-2">
            {loading ? (
              "Submitting…"
            ) : (
              <>
                Request Access <ChevronRight size={15} />
              </>
            )}
          </span>
        </Button>
      </div>
    </div>
  );
}
