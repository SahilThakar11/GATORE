import { CafeCard, type Cafe } from "./CafeCard";

// Mock data — swap with API call later
const FEATURED_CAFES: Cafe[] = [
  {
    id: "adventurers-guild",
    name: "Adventurers Guild",
    address: "148 University St., Waterloo",
    rating: 4.5,
    reviewCount: 125,
    gameCount: 156,
    timeSlots: ["5:30 PM", "6:00 PM", "6:30 PM"],
    logoSrc: "/adventures_guild_logo.png",
  },
  {
    id: "hive",
    name: "Hive",
    address: "148 University St., Waterloo",
    rating: 4.8,
    reviewCount: 200,
    gameCount: 210,
    timeSlots: ["5:00 PM", "6:30 PM", "7:00 PM"],
    logoSrc: "/hive_logo.png",
  },
  {
    id: "heroic-tabletop",
    name: "Heroic Tabletop",
    address: "148 University St., Waterloo",
    rating: 4.6,
    reviewCount: 90,
    gameCount: 150,
    timeSlots: ["5:15 PM", "6:45 PM", "7:15 PM"],
    logoSrc: "/heroic_tabletop_logo.png",
  },
  {
    id: "snakes-and-lattes",
    name: "Snakes & Lattes",
    address: "148 University St., Waterloo",
    rating: 4.8,
    reviewCount: 120,
    gameCount: 200,
    timeSlots: ["5:30 PM", "7:00 PM", "7:30 PM"],
    logoSrc: "/snakes_lattes_logo.png",
  },
  {
    id: "galactic-conquest",
    name: "Galactic Conquest",
    address: "148 University St., Waterloo",
    rating: 4.7,
    reviewCount: 85,
    gameCount: 175,
    timeSlots: ["5:45 PM", "7:15 PM", "7:45 PM"],
    logoSrc: "/galactic_conquest_logo.png",
  },
  {
    id: "re-roll",
    name: "Re-Roll",
    address: "148 University St., Waterloo",
    rating: 4.9,
    reviewCount: 120,
    gameCount: 225,
    timeSlots: ["5:15 PM", "6:45 PM", "7:15 PM"],
    logoSrc: "/re_roll_logo.png",
  },
];

interface FeaturedCafesProps {
  city?: string;
}

export function FeaturedCafes({ city = "Waterloo" }: FeaturedCafesProps) {
  return (
    <section className="max-w-7xl mx-auto px-7 py-10">
      <h2 className="text-xl font-bold text-gray-900 mb-1">
        Featured cafés in {city}
      </h2>
      <div className="w-20 h-1 bg-warm-400 mb-6 rounded-full" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURED_CAFES.map((cafe) => (
          <CafeCard key={cafe.id} cafe={cafe} />
        ))}
      </div>
    </section>
  );
}
