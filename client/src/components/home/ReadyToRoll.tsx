import { useNavigate } from "react-router-dom";

export function ReadyToRoll() {
  const navigate = useNavigate();

  return (
    <section className="w-full bg-teal-700 py-16 px-7">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 text-center">
        <h2 className="text-2xl font-bold text-white">Ready to roll?</h2>
        <p className="text-sm text-teal-100">
          Find a board game café near you and book your next game night
        </p>
        <button
          onClick={() => navigate("/find-a-cafe")}
          className="mt-2 bg-white text-teal-700 hover:bg-teal-50 text-sm font-semibold px-8 py-3 rounded-lg transition-colors duration-150 border border-white/20 cursor-pointer"
        >
          Find a café
        </button>
      </div>
    </section>
  );
}
