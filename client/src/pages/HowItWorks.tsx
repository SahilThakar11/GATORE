import { Link } from "react-router-dom";
import {
  Search,
  Calendar,
  Gamepad2,
  CheckCircle,
  PartyPopper,
} from "lucide-react";

const STEPS = [
  {
    number: 1,
    icon: Search,
    title: "Browse & Discover",
    description:
      "Search for board game cafés in your area or find cafés that have your favourite games. Filter by location, available games, ratings, and amenities.",
    persona: "Alex starts searching for cafés",
    personaStep: "Step 1 of 5",
    avatarColor: "bg-orange-300",
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
    avatarColor: "bg-teal-300",
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
    avatarColor: "bg-purple-300",
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
    avatarColor: "bg-blue-300",
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
    avatarColor: "bg-pink-300",
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
function PersonaBubble({ persona, step }: { persona: string; step: string }) {
  return (
    <div className="inline-flex items-center gap-4 rounded-full px-3 py-1.5  mb-4">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-[60px]`}
      >
        👨🏾‍💻
      </div>
      <div>
        <p className="text-xs font-semibold text-teal-600 leading-none">
          {persona}
        </p>
        <p className="text-[10px] text-neutral-400 mt-0.5">{step}</p>
      </div>
    </div>
  );
}

// ─── FAQ accordion item ───────────────────────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border border-warm-300 bg-white rounded-xl overflow-hidden">
      <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none text-sm font-semibold text-neutral-800 hover:text-teal-700 transition-colors">
        {q}
        <span className="text-gray-400 group-open:rotate-180 transition-transform duration-200 shrink-0">
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
      <div className="px-5 pb-4 text-sm text-neutral-600 leading-relaxed border-t border-gray-50 pt-3">
        {a}
      </div>
    </details>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HowItWorksPage() {
  return (
    <div className="bg-[#faf8f4]">
      {/* Hero banner */}
      <div className="bg-teal-700 py-14 text-center px-6">
        <h1 className="text-3xl font-black text-white">How It Works</h1>
        <p className="text-teal-200 text-sm mt-2 max-w-md mx-auto leading-relaxed">
          Finding and booking your perfect board game café spot has never been
          easier. Here's how our platform works in five simple steps.
        </p>
      </div>

      {/* Steps */}
      <div className="max-w-4xl mx-auto px-7 py-16 flex flex-col gap-20">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isLeft = step.imageSide === "left";

          const textBlock = (
            <div className="flex-1 flex flex-col justify-center">
              <PersonaBubble persona={step.persona} step={step.personaStep} />
              <div className="flex flex-row items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-white" />
                </div>
                <div className="text-4xl text-warm-400 ">{step.number}</div>
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-3">
                {step.title}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed max-w-sm">
                {step.description}
              </p>
            </div>
          );

          const imageBlock = (
            <div className="flex-1 flex justify-center">
              <img src={step.image} alt={`Step ${step.number} screenshot`} />
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
      </div>

      {/* CTA band */}
      <div className="bg-white border-y border-gray-100 py-14 text-center px-6">
        <h2 className="text-2xl font-black text-gray-900">
          Ready to Get Started?
        </h2>
        <p className="text-sm text-gray-500 mt-2 mb-7">
          Start exploring board game cafés near you and make your first
          reservation today.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link
            to="/find-a-cafe"
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Find a Café →
          </Link>
          <Link
            to="/find-a-game"
            className="flex items-center gap-2 border border-teal-600 bg-white  hover:bg-warm-100 text-sm font-bold text-teal-700 px-6 py-3 rounded-xl transition-colors"
          >
            Search by Game{" "}
            <img src="/icons/pawn.png" alt="pawn icon" className="w-3.5 h-6" />
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto px-7 py-16">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-gray-900">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Everything you need to know about booking with us
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </div>
  );
}
