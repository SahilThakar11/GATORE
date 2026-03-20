import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  CalendarCheck,
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
    title: "Request Access",
    desc: "Submit your café details. Our team reviews and activates your account within 48 hours.",
  },
  {
    step: "02",
    title: "Set Up Your Profile",
    desc: "Add your game library, hours, photos, and amenities to attract the right guests.",
  },
  {
    step: "03",
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

  const openModal = (defaultStep: "choose" | "signin" | "request" = "choose") =>
    setModal({ open: true, defaultStep });

  const closeModal = () => setModal((prev) => ({ ...prev, open: false }));

  return (
    <div className="bg-[#faf8f4]">
      {/* ── Hero — single CTA button ──────────────────────────────────────── */}
      <div
        className="relative py-20 px-6 text-center overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #0f4c3a 0%, #0f766e 50%, #134e4a 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-5" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Building2 size={13} /> For Café Owners
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight">
            Grow Your Café
            <br />
            with Gatore
          </h1>
          <p className="text-teal-200 text-sm mt-4 leading-relaxed max-w-lg mx-auto">
            Join the platform that connects board game enthusiasts with great
            cafés. Manage bookings, showcase your game library, and fill more
            tables — every night.
          </p>
          <div className="mt-8">
            <button
              onClick={() => openModal("choose")}
              className="bg-white text-teal-700 hover:bg-teal-50 text-sm font-bold px-8 py-3.5 rounded-xl transition-colors shadow-lg cursor-pointer"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-7 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-gray-900">
            Everything you need to run a great café
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Built specifically for board game café owners
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-warm-100 rounded-xl border border-warm-300 p-6 hover:shadow-md hover:border-teal-200 transition-all duration-200"
            >
              <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center mb-3">
                <Icon size={16} className="text-teal-600" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works for owners */}
      <section className="bg-warm-50 border-t border-b border-warm-300 py-16 px-7">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-gray-900">
              How onboarding works
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Up and running in under 48 hours
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6">
            {HOW_IT_WORKS.map(({ step, title, desc }, i) => (
              <div
                key={step}
                className="flex-1 flex flex-col items-center text-center relative"
              >
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden sm:block absolute top-5 left-[calc(50%+28px)] right-0 h-px bg-gray-200" />
                )}
                <div className="w-10 h-10 rounded-full bg-teal-600 text-white text-sm font-black flex items-center justify-center mb-3 relative z-10 shadow-sm shadow-teal-200">
                  {step}
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  {title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-7 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-gray-900">
            Loved by café owners
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Here's what our partners say about Gatore
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {TESTIMONIALS.map(({ quote, name, cafe, avatar, avatarBg }) => (
            <div
              key={name}
              className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col gap-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    className="text-amber-400 fill-amber-400"
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed flex-1">
                "{quote}"
              </p>
              <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                <div
                  className={`w-8 h-8 rounded-full ${avatarBg} flex items-center justify-center text-white text-xs font-black shrink-0`}
                >
                  {avatar}
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-800">{name}</p>
                  <p className="text-xs text-gray-400">{cafe}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Pricing teaser ───────────────────────────────────────────────── */}
      <div className="bg-white border-y border-gray-100 py-14 px-6 text-center">
        <h2 className="text-xl font-black text-gray-900">
          Simple, transparent pricing
        </h2>
        <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
          Start for free, upgrade as you grow. No hidden fees, no long-term
          contracts.
        </p>
        <Link
          to="/pricing"
          className="inline-flex items-center gap-2 mt-5 text-sm font-bold text-teal-600 hover:text-teal-800 transition-colors"
        >
          View pricing plans →
        </Link>
      </div>

      {/* ── Trust footer band ────────────────────────────────────────────── */}
      <div className="py-12 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-center flex-wrap gap-8">
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2 text-xs text-gray-500"
            >
              <Icon size={13} className="text-teal-500" />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Modal ────────────────────────────────────────────────────────── */}
      <BusinessPortalModal
        isOpen={modal.open}
        onClose={closeModal}
        defaultStep={modal.defaultStep}
      />
    </div>
  );
}
