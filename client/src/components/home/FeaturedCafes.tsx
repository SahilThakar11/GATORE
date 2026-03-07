import { Link } from "react-router-dom";
import { Star, MapPin, Clock, Gamepad2 } from "lucide-react";
import { useCafes, type CafeSummary, formatMinutes } from "../../hooks/useCafe";
import { CafeCard } from "./CafeCard";

function CafeCardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5 animate-pulse">
      <div className="flex gap-4">
        <div className="w-14 h-14 rounded-xl bg-gray-100 shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <div className="h-4 bg-gray-100 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
          <div className="h-3 bg-gray-100 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

// function CafeCard({ cafe }: { cafe: CafeSummary }) {
//   // Derive "open now" from operating hours
//   const now = new Date();
//   const todayName = now.toLocaleDateString("en-US", { weekday: "long" });
//   const nowMinutes = now.getHours() * 60 + now.getMinutes();
//   const todayHours = cafe.operatingHours.find((h) => h.dayOfWeek === todayName);
//   const openNow =
//     todayHours &&
//     !todayHours.isClosed &&
//     nowMinutes >= todayHours.openTime &&
//     nowMinutes < todayHours.closeTime;

//   const todayLabel = todayHours
//     ? todayHours.isClosed
//       ? "Closed today"
//       : `${formatMinutes(todayHours.openTime)} – ${formatMinutes(todayHours.closeTime)}`
//     : "Hours unavailable";

//   return (
//     <Link
//       to={`/cafe/${cafe.id}`}
//       className="group flex flex-col bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md hover:border-teal-200 transition-all duration-200"
//     >
//       <div className="flex items-start gap-4">
//         {/* Logo */}
//         <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 shrink-0">
//           {cafe.logoUrl ? (
//             <img
//               src={cafe.logoUrl}
//               alt={cafe.name}
//               className="w-full h-full object-cover"
//             />
//           ) : (
//             <div className="w-full h-full bg-teal-700 flex items-center justify-center text-white font-black text-xl">
//               {cafe.name[0]}
//             </div>
//           )}
//         </div>

//         <div className="flex-1 min-w-0">
//           <div className="flex items-start justify-between gap-2">
//             <h3 className="text-sm font-bold text-gray-900 group-hover:text-teal-700 transition-colors leading-tight truncate">
//               {cafe.name}
//             </h3>
//             <span
//               className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
//                 openNow
//                   ? "bg-green-50 text-green-600 border border-green-200"
//                   : "bg-gray-100 text-gray-400 border border-gray-200"
//               }`}
//             >
//               {openNow ? "● Open" : "○ Closed"}
//             </span>
//           </div>
//           <p className="text-xs text-gray-400 mt-0.5 truncate">
//             {cafe.tagline}
//           </p>
//         </div>
//       </div>

//       <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-3">
//         <div className="flex items-center gap-1 text-gray-400">
//           <MapPin size={11} />
//           <span className="text-xs truncate">
//             {cafe.address}, {cafe.city}
//           </span>
//         </div>
//         <div className="flex items-center gap-1">
//           <Star size={11} className="text-amber-400 fill-amber-400" />
//           <span className="text-xs font-bold text-gray-700">
//             {Number(cafe.rating).toFixed(1)}
//           </span>
//           <span className="text-xs text-gray-400">({cafe.reviewCount})</span>
//         </div>
//         <div className="flex items-center gap-1 text-gray-400">
//           <Gamepad2 size={11} />
//           <span className="text-xs">{cafe._count.restaurantGames} games</span>
//         </div>
//         <div className="flex items-center gap-1 text-gray-400">
//           <Clock size={11} />
//           <span className="text-xs">{todayLabel}</span>
//         </div>
//       </div>
//     </Link>
//   );
// }

interface FeaturedCafesProps {
  city?: string;
  limit?: 6;
}

export function FeaturedCafes({ city, limit = 6 }: FeaturedCafesProps) {
  const { cafes, loading, error } = useCafes(city);
  const displayed = cafes.slice(0, limit);

  return (
    <section className="max-w-7xl mx-auto px-7 py-10">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Featured cafés</h2>
      <div className="w-20 h-1 bg-warm-400 mb-6 rounded-full" />

      {error && (
        <p className="text-sm text-red-500 mb-4">Failed to load cafés.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? [...Array(6)].map((_, i) => <CafeCardSkeleton key={i} />)
          : displayed.map((cafe) => <CafeCard key={cafe.id} cafe={cafe} />)}
      </div>
    </section>
  );
}
