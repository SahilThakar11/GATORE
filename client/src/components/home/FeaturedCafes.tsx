import { useCafes } from "../../hooks/useCafe";
import { CafeCard } from "./CafeCard";

function CafeCardSkeleton() {
  return (
    <div
      className="bg-white rounded-[8px] animate-pulse"
      style={{
        padding: "24px 28px",
        boxShadow: "0px 2px 8px 0px rgba(0,0,0,0.08)",
      }}
    >
      <div className="flex gap-4">
        <div className="w-20 h-20 rounded-[8px] bg-gray-100 shrink-0" />
        <div className="flex-1 flex flex-col gap-2 justify-center">
          <div className="h-4 bg-gray-100 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/2" />
          <div className="h-3 bg-gray-100 rounded w-2/3" />
          <div className="h-5 bg-gray-100 rounded-full w-20" />
        </div>
      </div>
    </div>
  );
}

interface FeaturedCafesProps {
  city?: string;
  limit?: 6;
}

export function FeaturedCafes({ city, limit = 6 }: FeaturedCafesProps) {
  const { cafes, loading, error } = useCafes(city);
  const displayed = cafes.slice(0, limit);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-7 py-10">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Featured cafés</h2>
      <div className="w-20 h-1 bg-warm-400 mb-6 rounded-full" />

      {error && (
        <p className="text-sm text-red-500 mb-4">Failed to load cafés.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading
          ? [...Array(6)].map((_, i) => <CafeCardSkeleton key={i} />)
          : displayed.map((cafe) => (
              <CafeCard
                key={cafe.id}
                id={cafe.id}
                image={cafe.logoUrl}
                title={cafe.name}
                location={`${cafe.address}, ${cafe.city}`}
                rating={cafe.rating}
                reviewCount={cafe.reviewCount}
                gameCount={cafe._count.restaurantGames}
              />
            ))}
      </div>
    </section>
  );
}
