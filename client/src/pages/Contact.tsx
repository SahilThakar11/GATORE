import { useState } from "react";
import { Link } from "react-router-dom";
import { PageHero } from "../components/PageHero";
import { Mail, MapPin, Clock, ArrowRight } from "lucide-react";
import { Input } from "../components/ui/Input";
import { Dropdown } from "../components/ui/Dropdown";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { TextButton } from "../components/ui/TextButton";

const CONTACT_INFO = [
  {
    icon: Mail,
    label: "Email us",
    value: "noreplygatore@gmail.com",
    sub: "We respond within 1 business day",
  },
  {
    icon: MapPin,
    label: "Based in",
    value: "Waterloo, Ontario",
    sub: "Serving cafés across Canada",
  },
  {
    icon: Clock,
    label: "Support hours",
    value: "Mon – Fri, 9am – 5pm EST",
    sub: "Emergency support for active cafés",
  },
];

const REASONS = [
  "I want to partner my café with GATORE",
  "I have a question about pricing",
  "I need technical support",
  "I have a general inquiry",
  "Other",
];

interface FormState {
  name: string;
  email: string;
  reason: string;
  message: string;
}

export default function Contact() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    reason: REASONS[0],
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (patch: Partial<FormState>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  const isValid =
    form.name.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.message.trim().length >= 10;

  const handleSubmit = async () => {
    if (!isValid) return;
    setLoading(true);
    // TODO: wire to backend contact endpoint
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <main className="bg-warm-50 min-h-screen">
      <PageHero
        eyebrow="Get in touch"
        title="We'd love to"
        highlight="hear from you"
        subtitle="Whether you're a café owner, a curious customer, or just have a question — we're here."
      />

      <section
        aria-labelledby="contact-heading"
        className="max-w-4xl mx-auto px-4 sm:px-7 py-16 flex flex-col gap-10"
      >
        <h2 id="contact-heading" className="sr-only">
          Contact us
        </h2>

        {/* Contact info row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-10 border-b border-warm-300 px-4 sm:px-0">
          {CONTACT_INFO.map(({ icon: Icon, label, value, sub }) => (
            <div key={label} className="flex gap-4 items-start sm:justify-center">
              <div className="shrink-0 mt-1">
                <Icon size={18} className="text-teal-700" aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-0.5">
                  {label}
                </p>
                <p className="text-sm font-semibold text-gray-800">{value}</p>
                <p className="text-xs text-gray-600 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        {submitted ? (
          <div className="bg-white rounded-[8px] border border-warm-300 p-10 flex flex-col items-center text-center gap-4 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center">
                <span className="text-white text-xl" aria-hidden="true">
                  ✓
                </span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Message sent!</h3>
            <p className="text-sm text-gray-600 max-w-xs leading-relaxed">
              Thanks for reaching out, {form.name.split(" ")[0]}. We'll get back
              to you at{" "}
              <span className="font-medium text-gray-800">{form.email}</span>{" "}
              within one business day.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setForm({
                  name: "",
                  email: "",
                  reason: REASONS[0],
                  message: "",
                });
              }}
              className="text-sm text-teal-700 font-medium hover:underline mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded"
            >
              Send another message
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-[8px] border border-warm-300 p-5 sm:p-8 shadow-sm flex flex-col gap-5">
            {/* Form heading */}
            <div>
              <span
                className="text-xs font-semibold tracking-widest uppercase text-teal-700"
                aria-hidden="true"
              >
                Contact form
              </span>
              <h2 className="text-2xl font-bold text-gray-900 mt-2">
                Send us a message
              </h2>
              <div
                className="w-20 h-1 bg-warm-400 rounded-full mt-3"
                aria-hidden="true"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  label="Your name"
                  type="text"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    update({ name: e.target.value })
                  }
                  className="bg-warm-50"
                />
              </div>
              <div className="flex-1">
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    update({ email: e.target.value })
                  }
                  className="bg-warm-50"
                />
              </div>
            </div>

            {/* Reason */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                What can we help with?
              </label>
              <Dropdown
                trigger="label"
                triggerLabel={form.reason}
                fullWidth
                triggerClassName="bg-warm-50"
                items={REASONS.map((r) => ({
                  label: r,
                  onClick: () => update({ reason: r }),
                }))}
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                rows={5}
                placeholder="Tell us more..."
                value={form.message}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  update({ message: e.target.value })
                }
                className="w-full px-4 py-3 border border-warm-300 rounded-[8px] text-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none bg-warm-50"
              />
            </div>

            <div className="[&_button]:w-full">
              <PrimaryButton
                label={loading ? "Sending..." : "Send message"}
                onClick={handleSubmit}
                disabled={!isValid}
                isLoading={loading}
                size="md"
                grayDisabled
              />
            </div>
          </div>
        )}

        {/* Café owner promo */}
        <div
          className="rounded-[8px] p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          style={{
            background:
              "linear-gradient(135deg, #0f4c3a 0%, #0f766e 50%, #134e4a 100%)",
          }}
        >
          <div>
            <p className="text-base font-bold text-white mb-1">
              Are you a café owner?
            </p>
            <p className="text-sm text-teal-50 leading-relaxed max-w-sm">
              Learn how GATORE can help you manage reservations, track your game
              library, and grow your community.
            </p>
          </div>
          <Link to="/partner" className="shrink-0" tabIndex={-1}>
            <TextButton
              label="View partner details"
              white
              size="small"
              rightIcon={<ArrowRight size={14} aria-hidden="true" />}
            />
          </Link>
        </div>
      </section>
    </main>
  );
}
