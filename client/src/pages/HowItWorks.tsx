import { useNavigate } from "react-router-dom";
import {
  Search,
  Calendar,
  Gamepad2,
  CheckCircle,
  PartyPopper,
} from "lucide-react";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { SecondaryButton } from "../components/ui/SecondaryButton";

const STEPS = [
  {
    number: 1,
    icon: Search,
    title: "Browse & Discover",
    description:
      "Search for board game cafés in your area or find cafés that have your favourite games. Filter by location, available games, ratings, and amenities.",
    persona: "Alex starts searching for cafés",
    personaStep: "Step 1 of 5",
    emoji: "👨🏾‍💻",
    imageSide: "right",
    image: "images/browse_discover.png",
  },
  {
    number: 2,
    icon: Calendar,
    title: "Select Your Spot",
    description:
      "Choose your preferred date, time, and table size. View real-time availability and select the perfect spot for your gaming session.",
    persona: "Alex picks the perfect time",
    personaStep: "Step 2 of 5",
    emoji: "👨🏾‍💻",
    imageSide: "left",
    image: "images/select_spot.png",
  },
  {
    number: 3,
    icon: Gamepad2,
    title: "Choose Your Game",
    description:
      "Browse the café's full game library and request games to be set up at your table before you arrive. No waiting, just playing.",
    persona: "Alex picks the perfect game",
    personaStep: "Step 3 of 5",
    emoji: "👨🏾‍💻",
    imageSide: "right",
    image: "images/choose_game.png",
  },
  {
    number: 4,
    icon: CheckCircle,
    title: "Reserve Instantly",
    description:
      "Confirm your reservation in seconds. Receive instant confirmation with all the details you need for your visit.",
    persona: "Alex confirms the booking",
    personaStep: "Step 4 of 5",
    emoji: "👨🏾‍💻",
    imageSide: "left",
    image: "images/reserve_instantly.png",
  },
  {
    number: 5,
    icon: PartyPopper,
    title: "Play & Enjoy",
    description:
      "Show up and start playing! Your table is reserved and waiting. Browse the café's game library and enjoy your gaming experience.",
    persona: "Alex enjoys game night!",
    personaStep: "Step 5 of 5",
    emoji: "👨🏾‍💻",
    imageSide: "right",
    image: "images/play_enjoy.png",
  },
];

const FAQS = [
  {
    q: "How far in advance can I book?",
    a: "You can book up to 30 days in advance. Most cafés allow same-day bookings depending on availability.",
  },
  {
    q: "Can I modify or cancel my reservation?",
    a: "Yes — you can modify or cancel your reservation up to 2 hours before your scheduled time, free of charge.",
  },
  {
    q: "Do I need to pay upfront?",
    a: "You can choose to pay online for a seamless experience or pay at the café when you arrive. Some cafés may require a deposit for larger groups.",
  },
  {
    q: "What if the café doesn't have the game I want?",
    a: "You can browse each café's game library before booking. If a game is temporarily unavailable, staff will suggest alternatives.",
  },
  {
    q: "Can I book for a large group or event?",
    a: "Absolutely. Select 6+ players when booking and the café will prepare a suitable table. For private events, contact the café directly.",
  },
];

// ─── Persona bubble ───────────────────────────────────────────────────────────
function PersonaBubble({ persona, step, emoji }: { persona: string; step: string; emoji: string }) {
  return (
    <div className="inline-flex items-center gap-4 rounded-full px-3 py-1.5 mb-4">
      <div
        aria-hidden="true"
        className="w-10 h-10 rounded-full flex items-center justify-center text-[60px]"
      >
        {emoji}
      </div>
      <div>
        <p className="text-sm font-semibold text-teal-700 leading-none">
          {persona}
        </p>
        <p className="text-sm text-gray-500 mt-0.5">{step}</p>
      </div>
    </div>
  );
}

// ─── FAQ accordion item ───────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border border-warm-300 bg-white rounded-[8px] overflow-hidden">
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HowItWorksPage() {
  const navigate = useNavigate();
  return (
    <main className="bg-warm-50">
      {/* Hero */}
      <section
        aria-labelledby="hero-heading"
        className="bg-warm-100 border-b border-warm-300 py-16 px-4 sm:px-7 text-center"
      >
        <div className="max-w-2xl mx-auto flex flex-col items-center gap-3">
          <span className="text-xs font-semibold tracking-widest uppercase text-teal-700">
            How It Works
          </span>
          <h1
            id="hero-heading"
            className="text-3xl sm:text-4xl font-bold text-gray-800 leading-tight"
          >
            Your perfect game night in five steps
          </h1>
          <p className="text-base text-gray-500 leading-relaxed max-w-lg">
            Finding and booking your perfect board game café spot has never been
            easier.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section
        aria-labelledby="steps-heading"
        className="max-w-4xl mx-auto px-4 sm:px-7 py-16 flex flex-col gap-20"
      >
        <h2 id="steps-heading" className="sr-only">
          Step by step guide
        </h2>
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isLeft = step.imageSide === "left";

          const textBlock = (
            <div className="flex-1 flex flex-col justify-center">
              <PersonaBubble persona={step.persona} step={step.personaStep} emoji={step.emoji} />
              <div className="flex flex-row items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-[8px] bg-teal-700 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-white" aria-hidden="true" />
                </div>
                <div aria-hidden="true" className="text-4xl text-warm-500">
                  {step.number}
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">
                {step.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
                {step.description}
              </p>
            </div>
          );

          const imageBlock = (
            <div className="flex-1 flex justify-center">
              <img
                src={step.image}
                alt={`Step ${step.number}: ${step.title}`}
              />
            </div>
          );

          return (
            <div
              key={step.number}
              className={`flex flex-col sm:flex-row items-center gap-10 ${
                isLeft ? "sm:flex-row-reverse" : ""
              }`}
            >
              {textBlock}
              {imageBlock}
            </div>
          );
        })}
      </section>

      {/* CTA band */}
      <section
        aria-labelledby="cta-heading"
        className="bg-warm-100 border-y border-warm-300 py-14 text-center px-4 sm:px-7"
      >
        <h2
          id="cta-heading"
          className="text-2xl font-bold text-teal-700"
        >
          Ready to Get Started?
        </h2>
        <p className="text-sm text-gray-500 mt-2 mb-7">
          Start exploring board game cafés near you and make your first
          reservation today.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <PrimaryButton
            label="Find a Café"
            onClick={() => navigate("/find-a-cafe")}
            size="sm"
          />
          <SecondaryButton
            label="Search by Game"
            onClick={() => navigate("/find-a-game")}
            size="small"
            rightIcon={<img src="/icons/pawn.png" alt="" className="h-4 w-auto" />}
          />
        </div>
      </section>

      {/* FAQ */}
      <section
        aria-labelledby="faq-heading"
        className="max-w-2xl mx-auto px-4 sm:px-7 py-16"
      >
        <div className="mb-8">
          <h2
            id="faq-heading"
            className="text-2xl font-bold text-gray-800 mb-1"
          >
            Frequently Asked Questions
          </h2>
          <div className="w-20 h-1 bg-warm-400 rounded-full" aria-hidden="true" />
          <p className="text-sm text-gray-500 mt-3">
            Everything you need to know about booking with us
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>
    </main>
  );
}
