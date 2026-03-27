/**
 * TableIcon
 *
 * Renders a top-down table icon matching the seating style and capacity.
 * Uses `currentColor` so it inherits the parent's text colour.
 *
 * Supported types: "Round" | "Square" | "Booth" | "High-Top"
 * Supported capacities: 2 | 4 | 6 | 8 | 10 | 12 (falls back to 4 seats)
 */

type TableShape = "Round" | "Square" | "Booth" | "High-Top";

interface TableIconProps {
  type: TableShape;
  capacity: number;
  size?: number;
  className?: string;
}

type Seat = [number, number];

// All positions are within a 32×32 viewBox, table centred at (16,16).
// Seats sit ~14px from the centre on each side.

const AROUND_SEATS: Record<number, Seat[]> = {
  2:  [[16, 2],  [16, 30]],
  4:  [[16, 2],  [30, 16], [16, 30], [2, 16]],
  6:  [[10, 2],  [22, 2],  [30, 16], [22, 30], [10, 30], [2, 16]],
  8:  [[10, 2],  [22, 2],  [30, 10], [30, 22], [22, 30], [10, 30], [2, 22], [2, 10]],
  10: [[8,  2],  [16, 2],  [24, 2],  [30, 10], [30, 22], [24, 30], [16, 30], [8, 30], [2, 22], [2, 10]],
  12: [[8,  2],  [16, 2],  [24, 2],  [30, 9],  [30, 16], [30, 23], [24, 30], [16, 30], [8, 30], [2, 23], [2, 16], [2, 9]],
};

// Booth seats run only along top and bottom edges of the elongated table.
const BOOTH_SEATS: Record<number, Seat[]> = {
  2:  [[16, 2],  [16, 30]],
  4:  [[10, 2],  [22, 2],  [10, 30], [22, 30]],
  6:  [[8,  2],  [16, 2],  [24, 2],  [8,  30], [16, 30], [24, 30]],
  8:  [[6,  2],  [12, 2],  [20, 2],  [26, 2],  [6,  30], [12, 30], [20, 30], [26, 30]],
  10: [[5,  2],  [10, 2],  [16, 2],  [22, 2],  [27, 2],  [5,  30], [10, 30], [16, 30], [22, 30], [27, 30]],
  12: [[4,  2],  [9,  2],  [14, 2],  [18, 2],  [23, 2],  [28, 2],  [4,  30], [9,  30], [14, 30], [18, 30], [23, 30], [28, 30]],
};

function getSeats(capacity: number, type: TableShape): Seat[] {
  const seats = type === "Booth" ? BOOTH_SEATS : AROUND_SEATS;
  return seats[capacity] ?? seats[4];
}

export function TableIcon({ type, capacity, size = 32, className = "" }: TableIconProps) {
  const seats = getSeats(capacity, type);

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Table body */}
      {type === "Round" && (
        <circle cx={16} cy={16} r={8} fill="currentColor" />
      )}
      {type === "Square" && (
        <rect x={8} y={8} width={16} height={16} rx={3} fill="currentColor" />
      )}
      {type === "Booth" && (
        // Wide horizontal slab — represents the table between two benches
        <rect x={5} y={12} width={22} height={8} rx={3} fill="currentColor" />
      )}
      {type === "High-Top" && (
        // Smaller pedestal circle
        <circle cx={16} cy={16} r={5} fill="currentColor" />
      )}

      {/* Seat dots */}
      {seats.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={2.5} fill="currentColor" />
      ))}
    </svg>
  );
}
