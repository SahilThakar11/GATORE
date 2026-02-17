import React, { useState } from "react";
import { ReservationModal } from "./components/reservation/ReservationModal";
import type { Venue } from "./types/reservation.types";

const mockVenue: Venue = {
  id: "1",
  name: "Adventurers Guild",
  logo: "/images/cafe.png",
  address: "178 University Ave W, Waterloo, Ontario",
  rating: 4.5,
  reviewCount: 125,
  location: "Waterloo, ON",
  poster: "/images/poster.png",
};

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button
        onClick={() => setIsOpen(true)}
        className="px-6 py-3 bg-teal-500 text-white rounded-lg"
      >
        Make a Reservation
      </button>

      <ReservationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        venue={mockVenue}
      />
    </div>
  );
}

export default App;
