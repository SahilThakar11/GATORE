import { Search } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

export function HeroSection() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (query.trim()) navigate(`/find-a-cafe?q=${encodeURIComponent(query)}`);
  };

  return (
    <section
      className="relative w-full py-16 px-7 flex flex-col items-center justify-center text-center"
      style={{
        backgroundImage: "url('/images/hero_wood_texture.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0" />

      <div className="relative z-10 flex flex-col items-center gap-4 max-w-2xl w-full">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Find your game and book your table
        </h1>
        <p className="text-base text-white/80">
          Discover board game cafés and book tables with games ready when you
          arrive
        </p>

        {/* Search box */}
        <div className="lg:w-175 bg-white rounded-xl overflow-hidden mt-2 shadow-lg">
          <div className="flex flex-col gap-2.5 p-4.5">
            <Input
              type="text"
              placeholder="City or café name"
              value={query}
              leftIcon={<Search size={18} className="text-gray-400" />}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full"
            />
            <Button
              onClick={handleSearch}
              variant="primary"
              className="w-full"
              size="md"
            >
              Search
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
