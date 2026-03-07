import { Link } from "react-router-dom";
import { PageHero } from "../components/PageHero";
import { Check } from "lucide-react";

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description:
      "Perfect for cafés just getting started with online reservations.",
    highlight: false,
    features: [
      "Up to 5 tables",
      "Basic reservation management",
      "Game catalog (up to 50 games)",
      "Customer profiles",
      "Email confirmations",
    ],
    cta: "Get started free",
    ctaLink: "/contact",
  },
  {
    name: "Growth",
    price: "$49",
    period: "/ month",
    description:
      "For established cafés ready to grow their community and streamline operations.",
    highlight: true,
    features: [
      "Unlimited tables",
      "Full reservation management",
      "Unlimited game catalog",
      "Staff dashboard & alerts",
      "Customer analytics",
      "Game checkout & return tracking",
      "Waitlist management",
      "Priority support",
    ],
    cta: "Start free trial",
    ctaLink: "/contact",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description:
      "For multi-location cafés and chains with advanced operational needs.",
    highlight: false,
    features: [
      "Everything in Growth",
      "Multi-location management",
      "Advanced analytics & reports",
      "Custom integrations",
      "Dedicated onboarding",
      "SLA & uptime guarantee",
    ],
    cta: "Contact us",
    ctaLink: "/contact",
  },
];

const FAQ = [
  {
    q: "Is there a contract or commitment?",
    a: "No contracts. You can cancel anytime. We believe in earning your business month after month.",
  },
  {
    q: "Can I import my existing game catalog?",
    a: "Yes — our onboarding team will help you import your full collection during setup at no extra cost.",
  },
  {
    q: "Do customers pay to use GATORE?",
    a: "GATORE is completely free for customers. Only cafés pay a platform fee.",
  },
  {
    q: "What happens when I exceed my table limit on Starter?",
    a: "We'll notify you and make it easy to upgrade. We never cut off your service without warning.",
  },
];

export default function Pricing() {
  return (
    <div className="bg-[#faf8f4] min-h-screen">
      <PageHero
        eyebrow="Simple pricing"
        title="Plans that grow with"
        highlight="your café"
        subtitle="No hidden fees. No long-term contracts. Start free and upgrade when you're ready."
      />

      {/* Plans */}
      <section className="max-w-6xl mx-auto px-7 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-7 flex flex-col gap-5 ${
                plan.highlight
                  ? "bg-teal-700 border-teal-600 shadow-xl shadow-teal-900/20 scale-[1.02]"
                  : "bg-white border-gray-100 hover:shadow-md transition-shadow"
              }`}
            >
              {/* Plan name */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-semibold tracking-widest uppercase ${
                      plan.highlight ? "text-teal-300" : "text-teal-600"
                    }`}
                  >
                    {plan.name}
                  </span>
                  {plan.highlight && (
                    <span className="text-xs font-semibold bg-teal-500 text-white px-2.5 py-1 rounded-full">
                      Most popular
                    </span>
                  )}
                </div>
                <div className="flex items-end gap-1">
                  <span
                    className={`text-4xl font-black leading-none ${
                      plan.highlight ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className={`text-sm mb-1 ${
                        plan.highlight ? "text-teal-200" : "text-gray-400"
                      }`}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
                <p
                  className={`text-sm mt-2 leading-relaxed ${
                    plan.highlight ? "text-teal-100" : "text-gray-500"
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              {/* Features */}
              <ul className="flex flex-col gap-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <Check
                      size={15}
                      className={`shrink-0 mt-0.5 ${
                        plan.highlight ? "text-teal-300" : "text-teal-500"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        plan.highlight ? "text-teal-50" : "text-gray-600"
                      }`}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                to={plan.ctaLink}
                className={`w-full text-center text-sm font-semibold py-3 rounded-lg transition-colors duration-150 ${
                  plan.highlight
                    ? "bg-white text-teal-700 hover:bg-teal-50"
                    : "bg-teal-600 text-white hover:bg-teal-700"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white border-t border-gray-100 py-16 px-7">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">
              Frequently asked questions
            </h2>
            <div className="w-10 h-0.5 bg-teal-500 mx-auto mt-3" />
          </div>
          <div className="flex flex-col gap-6">
            {FAQ.map(({ q, a }) => (
              <div
                key={q}
                className="border-b border-gray-100 pb-6 last:border-0 last:pb-0"
              >
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">{q}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
