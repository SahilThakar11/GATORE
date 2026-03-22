import { Link } from "react-router-dom";
import { PageHero } from "../components/PageHero";
import { Check } from "lucide-react";

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border border-warm-300 bg-warm-50 rounded-[8px] overflow-hidden">
      <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none text-sm font-semibold text-gray-800 hover:text-teal-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-inset">
        {q}
        <span
          aria-hidden="true"
          className="text-gray-400 group-open:rotate-180 transition-transform duration-200 shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M4 6l4 4 4-4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </summary>
      <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed border-t border-warm-200 pt-3">
        {a}
      </div>
    </details>
  );
}

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
    <main className="bg-warm-50 min-h-screen">
      <PageHero
        eyebrow="Simple pricing"
        title="Plans that grow with"
        highlight="your café"
        subtitle="No hidden fees. No long-term contracts. Start free and upgrade when you're ready."
      />

      {/* Plans */}
      <section
        aria-labelledby="plans-heading"
        className="max-w-6xl mx-auto px-4 sm:px-7 py-16"
      >
        <h2 id="plans-heading" className="sr-only">
          Pricing plans
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-[8px] border p-7 flex flex-col gap-5 ${
                plan.highlight
                  ? "bg-teal-700 border-teal-600 shadow-xl shadow-teal-900/20 scale-[1.02]"
                  : "bg-white border-warm-300 hover:shadow-md transition-shadow"
              }`}
            >
              {/* Plan name */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3
                    className={`text-xs font-semibold tracking-widest uppercase ${
                      plan.highlight ? "text-white" : "text-teal-700"
                    }`}
                  >
                    {plan.name}
                  </h3>
                  {plan.highlight && (
                    <span className="text-xs font-semibold bg-teal-900 text-white px-2.5 py-1 rounded-full">
                      Most popular
                    </span>
                  )}
                </div>
                <div className="flex items-end gap-1">
                  <span
                    className={`text-4xl font-bold leading-none ${
                      plan.highlight ? "text-white" : "text-gray-800"
                    }`}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className={`text-sm mb-1 ${
                        plan.highlight ? "text-teal-100" : "text-gray-500"
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
                      aria-hidden="true"
                      className={`shrink-0 mt-0.5 ${
                        plan.highlight ? "text-teal-200" : "text-teal-500"
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
                className={`w-full text-center text-sm font-semibold py-3 rounded-[8px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                  plan.highlight
                    ? "bg-white text-teal-700 hover:bg-teal-50 focus-visible:ring-white focus-visible:ring-offset-teal-700"
                    : "bg-teal-700 text-white hover:bg-teal-800 focus-visible:ring-teal-600"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section
        aria-labelledby="faq-heading"
        className="bg-white border-t border-warm-300 py-16 px-4 sm:px-7"
      >
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <h2
              id="faq-heading"
              className="text-2xl font-bold text-gray-800 mb-1"
            >
              Frequently asked questions
            </h2>
            <div className="w-20 h-1 bg-warm-400 rounded-full" aria-hidden="true" />
          </div>
          <div className="flex flex-col gap-3">
            {FAQ.map(({ q, a }) => (
              <FaqItem key={q} q={q} a={a} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
