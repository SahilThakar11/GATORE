export interface Venue {
  id: string;
  name: string;
  logo: string;
  address: string;
  rating: number;
  reviewCount: number;
  location: string;
  poster: string;
}

export interface Game {
  id: string;
  name: string;
  image: string;
  complexity: "Easy" | "Medium" | "Hard";
  players: string;
  duration: string;
  price: number;
  tags: string[];
}

export interface BookingDetails {
  venue: Venue;
  date: string;
  time: string;
  partySize: number;
  selectedGame?: Game;
}

export interface UserDetails {
  email: string;
  phone: string;
  name?: string;
}

export interface PaymentDetails {
  nameOnCard: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

export interface ReservationData {
  booking: BookingDetails | null;
  user: UserDetails | null;
  payment: PaymentDetails | null;
  isGuest: boolean;
  isAuthenticated: boolean;
}
