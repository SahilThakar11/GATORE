import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { TextButton } from "../components/ui/TextButton";
import {
  BarChart3,
  CalendarCheck,
  ChevronDown,
  Gamepad2,
  HeadphonesIcon,
  Star,
  TrendingUp,
  Shield,
  Building2,
  Clock,
} from "lucide-react";
import { BusinessPortalModal } from "../components/businessPortal/BusinessPortalModal";

const FEATURES = [
  {
    icon: CalendarCheck,
    title: "Reservation Management",
    desc: "Handle all bookings from one dashboard. View, modify, and manage reservations in real time.",
  },
  {
    icon: BarChart3,
    title: "Analytics & Insights",
    desc: "Track peak hours, popular games, and customer trends to optimise your café's operations.",
  },
  {
    icon: Gamepad2,
    title: "Game Library Control",
    desc: "Keep your digital game catalogue up to date. Mark games as available or out of rotation instantly.",
  },
  {
    icon: HeadphonesIcon,
    title: "Dedicated Support",
    desc: "Our partner success team is on hand to help you get the most out of the platform.",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Reach",
    desc: "Get discovered by thousands of board game enthusiasts searching for their next café.",
  },
  {
    icon: Shield,
    title: "Secure & Reliable",
    desc: "Enterprise-grade infrastructure so your data and your customers' data are always safe.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    stepLabel: "Step 1",
    title: "Request Access",
    desc: "Submit your café details. Our team reviews and activates your account within 48 hours.",
  },
  {
    step: "02",
    stepLabel: "Step 2",
    title: "Set Up Your Profile",
    desc: "Add your game library, hours, photos, and amenities to attract the right guests.",
  },
  {
    step: "03",
    stepLabel: "Step 3",
    title: "Start Taking Bookings",
    desc: "Go live and start receiving reservations directly through the Gatore platform.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Since joining Gatore our Tuesday nights went from half-empty to fully booked every week. The dashboard is dead simple to use.",
    name: "Marco T.",
    cafe: "The Dice Den, Toronto",
    avatar: "M",
    avatarBg: "bg-teal-600",
  },
  {
    quote:
      "Our customers love being able to request games in advance. They show up ready to play and we have everything set on the table.",
    name: "Priya S.",
    cafe: "Meeple House, Waterloo",
    avatar: "P",
    avatarBg: "bg-amber-600",
  },
  {
    quote:
      "The onboarding team had us live within 24 hours. The analytics alone are worth it — finally know which games are actually popular.",
    name: "Jordan K.",
    cafe: "Roll & Roast, Hamilton",
    avatar: "J",
    avatarBg: "bg-purple-600",
  },
];

const TRUST_BADGES = [
  { icon: Shield, label: "Secure OTP login — no passwords" },
  { icon: Clock, label: "48-hour activation guarantee" },
  { icon: HeadphonesIcon, label: "Dedicated partner support" },
];

// ─── Single atomic modal state — fixes the race condition ─────────────────────
interface ModalState {
  open: boolean;
  defaultStep: "choose" | "signin" | "request";
}

export default function PartnerWithUs() {
  const [modal, setModal] = useState<ModalState>({
    open: false,
    defaultStep: "choose",
  });
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const toggleCard = (title: string) =>
    setExpandedCards((prev) => {
      const next = new Set(prev);
      next.has(title) ? next.delete(title) : next.add(title);
      return next;
    });

  const openModal = (defaultStep: "choose" | "signin" | "request" = "choose") =>
    setModal({ open: true, defaultStep });

  const closeModal = () => setModal((prev) => ({ ...prev, open: false }));
  const navigate = useNavigate();

  return (
    <main className="bg-warm-50">
      {/* ── Hero — single CTA button ──────────────────────────────────────── */}
      <section
        aria-labelledby="hero-heading"
        className="relative pt-20 pb-28 px-6 text-center overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0f4c3a 0%, #0f766e 50%, #134e4a 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-5" aria-hidden="true" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full mb-7">
            <Building2 size={13} aria-hidden="true" /> For Café Owners
          </div>
          <h1
            id="hero-heading"
            className="text-4xl sm:text-5xl font-bold text-white leading-tight"
          >
            Grow Your Café
            <br />
            with Gatore
          </h1>
          <p className="text-base text-white/80 mt-4 leading-relaxed max-w-lg mx-auto">
            Join the platform that connects board game enthusiasts with great
            cafés. Manage bookings, showcase your game library, and fill more
            tables — every night.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              onClick={() => openModal("choose")}
              aria-label="Get started — create or sign in to your business account"
              className="bg-white text-teal-700 hover:bg-teal-50 text-sm font-bold px-8 py-3.5 rounded-xl transition-colors shadow-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-800"
            >
              Get Started
            </button>
            <p className="text-white/80 text-sm">
              Up and running in{" "}
              <span className="text-white font-semibold">48 hours</span> —
              guaranteed
            </p>
          </div>
        </div>
      </section>

      {/* ── Dashboard Preview ────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 -mt-14 relative z-10 pb-8">
        <div className="overflow-hidden rounded-lg sm:rounded-xl lg:rounded-2xl shadow-2xl">
          <img src="/images/DashboardMockup.png" alt="" className="w-full" />
        </div>
      </div>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="features-heading"
        className="max-w-5xl mx-auto px-4 sm:px-7 py-16"
      >
        <div className="text-center mb-10">
          <h2
            id="features-heading"
            className="text-2xl font-bold text-gray-800"
          >
            <span className="text-teal-700">Everything you need</span> to run a great café
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Built specifically for board game café owners
          </p>
        </div>
        {/* Primary features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {FEATURES.slice(0, 3).map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-[8px] border border-warm-300 p-7 hover:shadow-md hover:border-teal-200 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-[8px] bg-teal-50 flex items-center justify-center mb-4">
                <Icon size={20} className="text-teal-600" aria-hidden="true" />
              </div>
              <div className="flex items-center justify-between sm:block">
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  {title}
                </h3>
                <button
                  onClick={() => toggleCard(title)}
                  aria-expanded={expandedCards.has(title)}
                  aria-label={`${expandedCards.has(title) ? "Collapse" : "Expand"} ${title}`}
                  className="sm:hidden text-gray-400 p-1 -mr-1 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded"
                >
                  <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className={`transition-transform duration-200 ${expandedCards.has(title) ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
              <p className={`text-sm text-gray-500 leading-relaxed ${expandedCards.has(title) ? "" : "hidden"} sm:block`}>
                {desc}
              </p>
            </div>
          ))}
        </div>
        {/* Secondary features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {FEATURES.slice(3).map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-warm-100 rounded-[8px] border border-warm-300 p-5 hover:shadow-sm hover:border-teal-200 transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-[8px] bg-teal-50 flex items-center justify-center mb-3">
                <Icon size={15} className="text-teal-600" aria-hidden="true" />
              </div>
              <div className="flex items-center justify-between sm:block">
                <h3 className="text-sm font-bold text-gray-900 mb-1">{title}</h3>
                <button
                  onClick={() => toggleCard(title)}
                  aria-expanded={expandedCards.has(title)}
                  aria-label={`${expandedCards.has(title) ? "Collapse" : "Expand"} ${title}`}
                  className="sm:hidden text-gray-400 p-1 -mr-1 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 rounded"
                >
                  <ChevronDown
                    size={16}
                    aria-hidden="true"
                    className={`transition-transform duration-200 ${expandedCards.has(title) ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
              <p className={`text-sm text-gray-500 leading-relaxed ${expandedCards.has(title) ? "" : "hidden"} sm:block`}>
                {desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works for owners */}
      <section
        aria-labelledby="onboarding-heading"
        className="bg-warm-50 border-t border-b border-warm-300 py-16 px-4 sm:px-7"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2
              id="onboarding-heading"
              className="text-2xl font-bold text-gray-800"
            >
              How onboarding works
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Up and running in under 48 hours
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6">
            {HOW_IT_WORKS.map(({ step, stepLabel, title, desc }, i) => (
              <div
                key={step}
                className="flex-1 flex flex-col items-center text-center relative"
              >
                {i < HOW_IT_WORKS.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="hidden sm:block absolute top-5 left-[calc(50%+28px)] right-0 h-px bg-gray-200"
                  />
                )}
                <div
                  aria-label={stepLabel}
                  className="w-10 h-10 rounded-full bg-teal-800 text-white text-sm font-black flex items-center justify-center mb-3 relative z-10 shadow-sm shadow-teal-200"
                >
                  <span aria-hidden="true">{step}</span>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  {title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section
        aria-labelledby="testimonials-heading"
        className="max-w-5xl mx-auto px-4 sm:px-7 py-16"
      >
        <div className="text-center mb-10">
          <h2
            id="testimonials-heading"
            className="text-2xl font-bold text-gray-800"
          >
            <span className="text-teal-700">Loved</span> by café owners
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Here's what our partners say about Gatore
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {TESTIMONIALS.map(({ quote, name, cafe, avatar, avatarBg }) => (
            <div
              key={name}
              className="bg-white border border-warm-300 rounded-[8px] p-5 flex flex-col gap-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex gap-0.5" aria-label="5 out of 5 stars">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    className="text-amber-400 fill-amber-400"
                    aria-hidden="true"
                  />
                ))}
              </div>
              <blockquote className="text-sm text-gray-600 leading-relaxed flex-1">
                "{quote}"
              </blockquote>
              <div className="flex items-center gap-3 pt-2 border-t border-warm-200">
                <div
                  aria-hidden="true"
                  className={`w-8 h-8 rounded-full ${avatarBg} flex items-center justify-center text-white text-xs font-black shrink-0`}
                >
                  {avatar}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-800">{name}</p>
                  <p className="text-xs text-gray-500">{cafe}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing teaser ───────────────────────────────────────────────── */}
      <section
        aria-labelledby="pricing-heading"
        className="bg-white border-y border-warm-300 py-14 px-4 sm:px-7 text-center"
      >
        <h2 id="pricing-heading" className="text-2xl font-bold text-gray-800">
          <span className="text-teal-700">Simple,</span> transparent pricing
        </h2>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          Start for free, upgrade as you grow. No hidden fees, no long-term
          contracts.
        </p>
        <p className="mt-4 text-sm text-gray-500">
          <span className="text-teal-700 font-semibold">Free</span> to start ·
          paid plans from{" "}
          <span className="text-gray-900 font-semibold">$49/mo</span>
        </p>
        <div className="mt-5">
          <TextButton
            label="View pricing plans"
            size="small"
            onClick={() => navigate("/pricing")}
          />
        </div>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────────────────── */}
      <section
        aria-labelledby="closing-cta-heading"
        className="py-20 px-6 text-center"
        style={{
          background:
            "linear-gradient(160deg, #094a46 0%, #0f6353 60%, #0d4d49 100%)",
        }}
      >
        <div className="max-w-xl mx-auto">
          <h2
            id="closing-cta-heading"
            className="text-3xl font-bold text-white"
          >
            Ready to grow your café?
          </h2>
          <p className="text-white/80 text-sm mt-4 leading-relaxed">
            Join a growing community of board game cafés and start filling
            tables from day one.
          </p>
          <button
            onClick={() => openModal("choose")}
            aria-label="Get started — create or sign in to your business account"
            className="mt-8 bg-white text-teal-700 hover:bg-teal-50 text-sm font-bold px-8 py-3.5 rounded-xl transition-colors shadow-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-800"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* ── Trust footer band ────────────────────────────────────────────── */}
      <section aria-label="Trust indicators" className="py-12 px-4 sm:px-7">
        <div className="max-w-3xl mx-auto flex items-center justify-center flex-wrap gap-8">
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 text-sm text-gray-600"
            >
              <Icon size={15} className="text-teal-600" aria-hidden="true" />
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* ── Modal ────────────────────────────────────────────────────────── */}
      <BusinessPortalModal
        isOpen={modal.open}
        onClose={closeModal}
        defaultStep={modal.defaultStep}
      />
    </main>
  );
}
