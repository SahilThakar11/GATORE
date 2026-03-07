import { useState } from "react";
import { PageHero } from "../components/PageHero";
import { Mail, MapPin, Clock } from "lucide-react";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";

const CONTACT_INFO = [
  {
    icon: Mail,
    label: "Email us",
    value: "hello@gatore.ca",
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
    <div className="bg-[#faf8f4] min-h-screen">
      <PageHero
        eyebrow="Get in touch"
        title="We'd love to"
        highlight="hear from you"
        subtitle="Whether you're a café owner, a curious customer, or just have a question — we're here."
      />

      <section className="max-w-6xl mx-auto px-7 py-16">
        <div className="flex gap-12 items-start">
          {/* Left — contact info */}
          <div className="w-72 shrink-0 flex flex-col gap-6">
            <div className="flex flex-col gap-5">
              {CONTACT_INFO.map(({ icon: Icon, label, value, sub }) => (
                <div key={label} className="flex gap-4 items-start">
                  <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon size={16} className="text-teal-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                      {label}
                    </p>
                    <p className="text-sm font-semibold text-gray-800">
                      {value}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Decorative teal card */}
            <div className="bg-teal-700 rounded-xl p-5 mt-2">
              <p className="text-sm font-bold text-white mb-1.5">
                Are you a café owner?
              </p>
              <p className="text-xs text-teal-200 leading-relaxed mb-3">
                Learn how GATORE can help you manage reservations, track your
                game library, and grow your community.
              </p>
              <a
                href="/partner"
                className="text-xs font-semibold text-teal-300 hover:text-white transition-colors"
              >
                View partner details →
              </a>
            </div>
          </div>

          {/* Right — form */}
          <div className="flex-1">
            {submitted ? (
              /* Success state */
              <div className="bg-white rounded-2xl border border-gray-100 p-10 flex flex-col items-center text-center gap-4 shadow-sm">
                <div className="w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center">
                    <span className="text-white text-xl">✓</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Message sent!
                </h3>
                <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
                  Thanks for reaching out, {form.name.split(" ")[0]}. We'll get
                  back to you at{" "}
                  <span className="font-medium text-gray-700">
                    {form.email}
                  </span>{" "}
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
                  className="text-sm text-teal-600 font-medium hover:underline mt-2"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm flex flex-col gap-5">
                <h2 className="text-lg font-bold text-gray-900">
                  Send us a message
                </h2>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      label="Your name"
                      type="text"
                      placeholder="Full name"
                      value={form.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        update({ name: e.target.value })
                      }
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
                    />
                  </div>
                </div>

                {/* Reason select */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    What can we help with?
                  </label>
                  <select
                    value={form.reason}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      update({ reason: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none bg-white"
                  >
                    {REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none resize-none"
                  />
                </div>

                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleSubmit}
                  disabled={!isValid || loading}
                >
                  {loading ? "Sending..." : "Send message"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
