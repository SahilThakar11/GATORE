import { Search, Calendar, Play, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "../ui/PrimaryButton";

const STEPS = [
  {
    number: "01",
    icon: Search,
    label: "Find your café",
    description: "Search by location, name, or game",
  },
  {
    number: "02",
    icon: Calendar,
    label: "Reserve your game",
    description: "Pick your game, date, time, and table size",
  },
  {
    number: "03",
    icon: Play,
    label: "Show up and play",
    description: "Your game will be ready and waiting",
  },
];

export function HowItWorks() {
  const navigate = useNavigate();

  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="max-w-7xl mx-auto px-4 sm:px-7 py-14"
    >
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
        {/* Left — image */}
        <div className="w-full md:w-auto md:shrink-0 md:max-w-[50%] rounded-2xl overflow-hidden shadow-md">
          <img
            src="/images/home_game_simplified.png"
            alt="People playing board games"
            className="w-full md:w-135.5 md:h-88 object-cover"
          />
        </div>

        {/* Right — content */}
        <div className="flex flex-col gap-6 flex-1 justify-center">
          <div>
            <h2
              id="how-it-works-heading"
              className="text-2xl sm:text-3xl font-bold text-neutral-900 leading-tight"
            >
              Your Game Night, <span className="text-teal-500">Simplified</span>
            </h2>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-5">
            {STEPS.map(({ number, icon: Icon, label, description }) => (
              <div key={number} className="flex items-center gap-4">
                <div className="w-12 h-12 shrink-0 rounded-full bg-teal-100 flex items-center justify-center">
                  <Icon
                    aria-hidden="true"
                    size={16}
                    className="text-teal-600"
                  />
                </div>

                <div className="flex flex-col items-start">
                  <span className="text-[12px] font-semibold text-teal-800 tracking-widest">
                    {number}
                  </span>
                  <span className="text-base text-[18px] font-medium text-neutral-800">
                    {label}
                  </span>
                  <span className="text-sm text-neutral-500 font-normal">
                    {description}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          {/* <PrimaryButton
            label="Find a café"
            onClick={() => navigate("/find-a-cafe")}
            size="md"
            rightIcon={<ArrowRight size={16} />}
          /> */}
        </div>
      </div>
    </section>
  );
}
