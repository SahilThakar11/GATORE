import { Search, Calendar, Play, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "../ui/PrimaryButton";

const STEPS = [
  {
    number: "01",
    icon: Search,
    label: "Find your cafe",
  },
  {
    number: "02",
    icon: Calendar,
    label: "Reserve your game",
  },
  {
    number: "03",
    icon: Play,
    label: "Show up and play",
  },
];

export function HowItWorks() {
  const navigate = useNavigate();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-7 py-14">
      <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
        {/* Left — image */}
        <div className="w-full md:w-auto md:shrink-0 md:max-w-[50%] rounded-2xl overflow-hidden shadow-md">
          <img
            src="/images/home_game_simplified.png"
            alt="People playing board games"
            className="w-full md:w-135.5 md:h-98.25 object-cover"
          />
        </div>

        {/* Right — content */}
        <div className="flex flex-col gap-6 flex-1">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-neutral-900 leading-tight">
              Your Game Night, <br />
              <span className="text-teal-500">Simplified</span>
            </h2>
          </div>

          {/* Steps */}
          <div className="flex flex-col gap-5">
            {STEPS.map(({ number, icon: Icon, label }) => (
              <div key={number} className="flex items-center gap-4">
                <div className="w-12 h-12 shrink-0 rounded-full bg-teal-100 flex items-center justify-center">
                  <Icon size={16} className="text-teal-600" />
                </div>

                <div className="flex flex-col items-start">
                  <span className="text-[12px] font-semibold text-teal-800 tracking-widest">
                    {number}
                  </span>
                  <span className="text-base text-[18px] font-medium text-neutral-800">
                    {label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <PrimaryButton
            label="Get Started"
            onClick={() => navigate("/find-a-cafe")}
            size="md"
            rightIcon={<ArrowRight size={16} />}
          />
        </div>
      </div>
    </section>
  );
}
