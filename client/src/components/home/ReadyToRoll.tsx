import { useNavigate } from "react-router-dom";
import { SecondaryButton } from "../ui/SecondaryButton";

export function ReadyToRoll() {
  const navigate = useNavigate();

  return (
    <section className="w-full bg-teal-700 py-12 sm:py-16 px-4 sm:px-7">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white">Ready to roll?</h2>
        <p className="text-sm text-teal-100 max-w-sm sm:max-w-none">
          Find a board game café near you and book your next game night
        </p>
        <SecondaryButton
          label="Find a café"
          onClick={() => navigate("/find-a-cafe")}
          size="medium"
        />
      </div>
    </section>
  );
}
