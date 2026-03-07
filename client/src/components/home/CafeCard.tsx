import { MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import type { CafeSummary } from "../../hooks/useCafe";

interface CafeCardProps {
  cafe: CafeSummary;
}

export function CafeCard({ cafe }: CafeCardProps) {
  return (
    <Link
      to={`/cafe/${cafe.id}`}
      className="block bg-warm-100 border border-warm-300 rounded-xl p-4 hover:shadow-md hover:border-teal-200 transition-all duration-200 group"
    >
      {/* Top row — logo + info */}
      <div className="flex items-start gap-3">
        <div className="w-30 h-30 rounded-lg overflow-hidden bg-gray-100 shrink-0 ">
          {cafe.logoUrl ? (
            <img
              src={cafe.logoUrl}
              alt={cafe.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
              IMG
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-[20px] font-bold text-neutral-800 group-hover:text-teal-700 transition-colors truncate">
            {cafe.name}
          </h3>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={11} className="text-neutral-400 shrink-0" />
            <span className="text-xs text-neutral-400 truncate">
              {cafe.address}
            </span>
          </div>

          {/* Rating + game count */}
          <div className="flex items-center gap-2 mt-1.5">
            <div className="flex items-center gap-1">
              <img src="/icons/star.svg" alt="star-icon" />
              <span className="text-[16px] font-semibold text-neutral-800">
                {cafe.rating}
              </span>
              <span className="text-[16px] text-neutral-800">
                ({cafe.reviewCount})
              </span>
            </div>
          </div>
          <div className="mt-1">
            <span className="text-xs bg-warm-300 text-neutral-800 px-3 py-1 rounded-full font-medium">
              {cafe._count.restaurantGames} games
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
