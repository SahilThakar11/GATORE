import { Link } from "react-router-dom";
import { MapPin, Star, Clock } from "lucide-react";

interface CafeResult {
  id: string;
  name: string;
  logoSrc?: string;
  address: string;
  rating: number;
  reviewCount: number;
  timeSlots: string[];
}

interface Props {
  cafe: CafeResult;
  gameName: string;
}

export function CafeResultCard({ cafe, gameName }: Props) {
  return (
    <Link
      to={`/cafe/${cafe.id}`}
      className="block bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md hover:border-teal-200 transition-all duration-200 group"
    >
      <div className="flex items-start gap-4">
        {/* Logo */}
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-100">
          {cafe.logoSrc ? (
            <img
              src={cafe.logoSrc}
              alt={cafe.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-teal-800 flex items-center justify-center text-white font-black text-xl">
              {cafe.name[0]}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-bold text-gray-900 group-hover:text-teal-700 transition-colors">
            {cafe.name}
          </h3>

          {/* Has game badge */}
          <div className="flex items-center gap-1.5 mt-1 mb-1.5">
            <span className="text-xs bg-teal-50 border border-teal-200 text-teal-700 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="text-[10px]">⊞</span> Has {gameName}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1 text-gray-400">
              <MapPin size={12} />
              <span className="text-xs">{cafe.address}</span>
            </div>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1.5">
            <Star size={13} className="text-amber-400 fill-amber-400" />
            <span className="text-sm font-bold text-gray-700">
              {cafe.rating}
            </span>
            <span className="text-sm text-gray-400">({cafe.reviewCount})</span>
          </div>
        </div>
      </div>

      {/* Time slots */}
      <div className="flex items-center gap-2 mt-4 flex-wrap">
        {cafe.timeSlots.map((slot) => (
          <span
            key={slot}
            className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-100 px-3 py-1.5 rounded-lg"
          >
            <Clock size={11} />
            {slot}
          </span>
        ))}
      </div>
    </Link>
  );
}
