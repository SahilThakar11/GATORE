import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  MapPin,
  Clock,
  Phone,
  Globe,
  Wifi,
  Coffee,
  ParkingCircle,
  ChevronLeft,
  Search,
  Filter,
} from "lucide-react";
import { useState } from "react";
import { useReservationFlow } from "../hooks/useReservationFlow";
import { useAuth } from "../context/AuthContext";

// ─── Mock data — swap with API call using `id` param ─────────────────────────
const MOCK_CAFE = {
  id: "adventurers-guild",
  name: "Adventurers Guild",
  tagline: "Waterloo's premier board game café & tavern",
  address: "148 University Ave W, Waterloo, ON N2L 3E9",
  phone: "(519) 885-0000",
  website: "adventurersguild.ca",
  rating: 4.5,
  reviewCount: 125,
  gameCount: 156,
  hours: {
    "Mon – Thu": "12pm – 11pm",
    "Fri – Sat": "12pm – 12am",
    Sunday: "12pm – 10pm",
  },
  amenities: [
    { icon: Wifi, label: "Free WiFi" },
    { icon: Coffee, label: "Full café menu" },
    { icon: ParkingCircle, label: "Parking nearby" },
  ],
  description:
    "Adventurers Guild is Waterloo's original board game café and tavern. With over 156 games in our library, craft beers on tap, and a full food menu — we're the perfect spot for a casual game night or a serious strategy session. Our knowledgeable staff will help you find the perfect game for your group.",
  timeSlots: ["5:00 PM", "5:30 PM", "6:00 PM", "6:30 PM", "7:00 PM", "7:30 PM"],
  logoSrc: undefined,
};

const MOCK_GAMES = [
  {
    id: "1",
    name: "Catan",
    category: "Strategy",
    players: "3–4",
    duration: "60–120 min",
    available: true,
  },
  {
    id: "2",
    name: "Ticket to Ride",
    category: "Strategy",
    players: "2–5",
    duration: "45–75 min",
    available: true,
  },
  {
    id: "3",
    name: "Codenames",
    category: "Party",
    players: "4–8+",
    duration: "15–30 min",
    available: true,
  },
  {
    id: "4",
    name: "Pandemic",
    category: "Co-op",
    players: "2–4",
    duration: "45–60 min",
    available: false,
  },
  {
    id: "5",
    name: "7 Wonders",
    category: "Strategy",
    players: "2–7",
    duration: "30–45 min",
    available: true,
  },
  {
    id: "6",
    name: "Azul",
    category: "Puzzle",
    players: "2–4",
    duration: "30–45 min",
    available: true,
  },
  {
    id: "7",
    name: "Dominion",
    category: "Card Games",
    players: "2–4",
    duration: "30 min",
    available: true,
  },
  {
    id: "8",
    name: "Betrayal at House",
    category: "RPG",
    players: "3–6",
    duration: "60 min",
    available: true,
  },
  {
    id: "9",
    name: "Dixit",
    category: "Party",
    players: "3–6",
    duration: "30 min",
    available: false,
  },
  {
    id: "10",
    name: "Root",
    category: "Strategy",
    players: "2–4",
    duration: "60–90 min",
    available: true,
  },
  {
    id: "11",
    name: "Wingspan",
    category: "Tableau",
    players: "1–5",
    duration: "40–70 min",
    available: true,
  },
  {
    id: "12",
    name: "Mysterium",
    category: "Co-op",
    players: "2–7",
    duration: "42 min",
    available: true,
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  Strategy: "bg-pink-100 text-pink-700",
  Party: "bg-purple-100 text-purple-700",
  "Co-op": "bg-yellow-100 text-yellow-700",
  Puzzle: "bg-blue-100 text-blue-700",
  "Card Games": "bg-teal-100 text-teal-700",
  RPG: "bg-rose-100 text-rose-700",
  Tableau: "bg-orange-100 text-orange-700",
};

const ALL_CATEGORIES = [
  "All",
  ...Array.from(new Set(MOCK_GAMES.map((g) => g.category))),
];

export default function CafeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const reservation = useReservationFlow();

  const [gameQuery, setGameQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const cafe = MOCK_CAFE; // TODO: fetch by `id`

  const filteredGames = MOCK_GAMES.filter((g) => {
    const matchesQuery = g.name.toLowerCase().includes(gameQuery.toLowerCase());
    const matchesCategory =
      activeCategory === "All" || g.category === activeCategory;
    return matchesQuery && matchesCategory;
  });

  const handleReserveClick = () => {};

  return (
    <div className="bg-[#faf8f4] min-h-screen">
      {/* ─── Hero banner ──────────────────────────────────────────────────── */}
      <div
        className="w-full h-52 relative"
        style={{
          backgroundImage: "url('/images/hero_wood_texture.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: "url('/hero-wood.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-5 left-7 flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors"
        >
          <ChevronLeft size={18} /> Back
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-7">
        {/* ─── Café identity card — overlaps hero ───────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-md -mt-16 relative z-10 p-6">
          <div className="flex items-start gap-5">
            {/* Logo */}
            <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0 -mt-10 shadow-sm">
              {cafe.logoSrc ? (
                <img
                  src={cafe.logoSrc}
                  alt={cafe.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-teal-700 flex items-center justify-center text-white text-2xl font-black">
                  {cafe.name[0]}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-black text-gray-900">
                    {cafe.name}
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5">{cafe.tagline}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {/* Rating */}
                    <div className="flex items-center gap-1">
                      <Star
                        size={14}
                        className="text-amber-400 fill-amber-400"
                      />
                      <span className="text-sm font-bold text-gray-700">
                        {cafe.rating}
                      </span>
                      <span className="text-sm text-gray-400">
                        ({cafe.reviewCount} reviews)
                      </span>
                    </div>
                    <span className="text-gray-200">·</span>
                    {/* Game count */}
                    <span className="text-xs bg-[#f5ede0] text-[#a07850] px-2.5 py-1 rounded-full font-semibold">
                      {cafe.gameCount} games
                    </span>
                    <span className="text-gray-200">·</span>
                    {/* Address */}
                    <div className="flex items-center gap-1 text-gray-400">
                      <MapPin size={12} />
                      <span className="text-xs">{cafe.address}</span>
                    </div>
                  </div>
                </div>

                {/* Reserve CTA */}
                <button
                  onClick={handleReserveClick}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors duration-150 shrink-0 shadow-sm shadow-teal-200"
                >
                  Reserve a Game
                </button>
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="flex items-center gap-5 mt-5 pt-4 border-t border-gray-100">
            {cafe.amenities.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 text-gray-500"
              >
                <Icon size={14} className="text-teal-500" />
                <span className="text-xs font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Main content ─────────────────────────────────────────────── */}
        <div className="flex gap-8 mt-8 pb-16">
          {/* Left — main content */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            {/* About */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <h2 className="text-base font-bold text-gray-900 mb-3">About</h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {cafe.description}
              </p>
            </div>

            {/* Available time slots */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900">
                  Available today
                </h2>
                <div className="flex items-center gap-1 text-teal-600">
                  <Clock size={14} />
                  <span className="text-xs font-medium">Walk-ins welcome</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {cafe.timeSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={handleReserveClick}
                    className="flex items-center gap-1.5 text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-100 px-4 py-2.5 rounded-xl hover:bg-teal-100 hover:border-teal-300 transition-all"
                  >
                    <Clock size={13} />
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Game library */}
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900">
                  Game library{" "}
                  <span className="text-gray-400 font-normal text-sm">
                    ({cafe.gameCount} games)
                  </span>
                </h2>
              </div>

              {/* Search + filter */}
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <Search
                    size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search games..."
                    value={gameQuery}
                    onChange={(e) => setGameQuery(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-700 bg-[#faf8f4] focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>

              {/* Category pills */}
              <div className="flex gap-2 flex-wrap mb-4">
                {ALL_CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                      activeCategory === cat
                        ? "bg-teal-600 border-teal-600 text-white"
                        : "bg-white border-gray-200 text-gray-600 hover:border-teal-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Games grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredGames.map((game) => (
                  <div
                    key={game.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                      game.available
                        ? "bg-white border-gray-100 hover:border-teal-200 transition-colors"
                        : "bg-gray-50 border-gray-100 opacity-60"
                    }`}
                  >
                    {/* Availability dot */}
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        game.available ? "bg-teal-500" : "bg-gray-300"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {game.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                            CATEGORY_COLORS[game.category] ??
                            "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {game.category}
                        </span>
                        <span className="text-xs text-gray-400">
                          {game.players}
                        </span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-400">
                          {game.duration}
                        </span>
                      </div>
                    </div>
                    {!game.available && (
                      <span className="text-xs text-gray-400 shrink-0">
                        Out
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="w-72 shrink-0 flex flex-col gap-5">
            {/* Quick reserve card */}
            <div className="bg-teal-700 rounded-xl p-5 text-center flex flex-col gap-3 sticky top-24">
              <p className="text-white font-bold text-base">Ready to play?</p>
              <p className="text-teal-200 text-xs leading-relaxed">
                Reserve your table and request games in advance — we'll have
                everything ready when you arrive.
              </p>
              <button
                onClick={handleReserveClick}
                className="w-full bg-white text-teal-700 hover:bg-teal-50 text-sm font-bold py-3 rounded-lg transition-colors"
              >
                Reserve a table
              </button>
              {!isAuthenticated && (
                <p className="text-teal-300 text-xs">
                  You'll need to sign in or use guest checkout to make a
                  reservation.
                </p>
              )}
            </div>

            {/* Hours */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Clock size={14} className="text-teal-500" /> Hours
              </h3>
              <div className="flex flex-col gap-2">
                {Object.entries(cafe.hours).map(([day, hours]) => (
                  <div key={day} className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{day}</span>
                    <span className="text-xs font-semibold text-gray-700">
                      {hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Contact</h3>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <MapPin size={14} className="text-teal-500 shrink-0" />
                  <span className="text-xs text-gray-600 leading-snug">
                    {cafe.address}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone size={14} className="text-teal-500 shrink-0" />
                  <span className="text-xs text-gray-600">{cafe.phone}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Globe size={14} className="text-teal-500 shrink-0" />
                  <a
                    href={`https://${cafe.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-teal-600 hover:underline"
                  >
                    {cafe.website}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
