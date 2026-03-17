import { MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

interface CafeCardProps {
  id: number;
  image: string | null;
  title: string;
  location: string;
  rating: number;
  reviewCount: number;
  gameCount: number;
}

export function CafeCard({
  id,
  image,
  title,
  location,
  rating,
  reviewCount,
  gameCount,
}: CafeCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      to={`/cafe/${id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative block bg-warm-100 border rounded-[8px] overflow-hidden transition-colors duration-200"
      style={{
        padding: "24px 28px",
        borderColor: hovered ? "#14B8A6" : "#E8D4C4",
        boxShadow: hovered
          ? "0px 8px 24px 0px rgba(0,0,0,0.14)"
          : "0px 2px 8px 0px rgba(0,0,0,0.08)",
        transition: "box-shadow 200ms, border-color 200ms",
      }}
    >
      {/* Teal gradient overlay from top */}
      <div
        className="absolute inset-x-0 top-0 h-56 rounded-t-[8px] pointer-events-none transition-opacity duration-200"
        style={{
          background:
            "linear-gradient(to bottom, rgba(20,184,166,0.10), transparent)",
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Info section — items-stretch so thumbnail matches text height */}
      <div className="relative flex items-stretch gap-4">
        {/* Thumbnail */}
        <div
          className="w-[120px] h-[120px] shrink-0 rounded-[8px] overflow-hidden bg-gray-100"
          style={{
            boxShadow:
              "0px 4px 6px -1px rgba(0,0,0,0.10), 0px 2px 4px -2px rgba(0,0,0,0.10)",
          }}
        >
          {image ? (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-teal-700 flex items-center justify-center text-white font-bold text-xl">
              {title[0]}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-1.5 min-w-0">
          {/* Title */}
          <p
            className="text-base font-semibold truncate"
            style={{ color: "#292524" }}
          >
            {title}
          </p>

          {/* Location */}
          <div className="flex items-center gap-1">
            <MapPin size={13} style={{ color: "#57534E", flexShrink: 0 }} />
            <span
              className="text-sm truncate"
              style={{ color: "#57534E", fontWeight: 400 }}
            >
              {location}
            </span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star
              size={13}
              style={{ color: "#F59E0B", fill: "#F59E0B", flexShrink: 0 }}
            />
            <span
              className="text-sm"
              style={{ color: "#292524", fontWeight: 600 }}
            >
              {Number(rating).toFixed(1)}
            </span>
            <span
              className="text-sm"
              style={{ color: "#292524", fontWeight: 400 }}
            >
              ({reviewCount})
            </span>
          </div>

          {/* Games pill */}
          <div className="flex">
            <span
              className="text-xs rounded-full"
              style={{
                backgroundColor: "#E8D4C4",
                color: "#292524",
                fontWeight: 500,
                padding: "4px 10px",
              }}
            >
              {gameCount} games
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
