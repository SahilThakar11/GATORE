import React from "react";
import { MapPin, Calendar, Users, Dice3 } from "lucide-react";
import { Card } from "../ui/Card";
import { formatCurrency, formatDate } from "../../utils/validation";
import type { BookingDetails } from "../../types/reservation.types";

interface BookingSummaryProps {
  booking: BookingDetails;
  showPricing?: boolean;
}

export const BookingSummary: React.FC<BookingSummaryProps> = ({
  booking,
  showPricing = true,
}) => {
  const gamePrice = booking.selectedGame?.price || 0;
  const reservationFee = 6;
  const total = gamePrice + reservationFee;

  return (
    <Card variant="default" padding="md" className="space-y-4 text-left">
      {/* Venue */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
          <MapPin className="w-5 h-5 text-amber-700" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            You're booking at
          </p>
          <p className="font-semibold text-gray-900">{booking.venue.name}</p>
          <p className="text-sm text-gray-600">{booking.venue.address}</p>
        </div>
      </div>

      {/* Date & Time */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
          <Calendar className="w-5 h-5 text-amber-700" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            When you're playing
          </p>
          <p className="font-semibold text-gray-900">
            {formatDate(booking.date)}
          </p>
          <p className="text-sm text-gray-600">{booking.time}</p>
        </div>
      </div>

      {/* Party Size */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
          <Users className="w-5 h-5 text-amber-700" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
            Your party size
          </p>
          <p className="font-semibold text-gray-900">
            {booking.partySize} players
          </p>
        </div>
      </div>

      {/* Game Selection */}
      {booking.selectedGame && (
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <Dice3 className="w-5 h-5 text-amber-700" />
          </div>
          <div className="flex-1 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Game on deck
              </p>
              <p className="font-semibold text-gray-900">
                {booking.selectedGame.name}
              </p>
            </div>
            {showPricing && (
              <p className="font-semibold text-gray-900">
                {formatCurrency(gamePrice)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Price Summary */}
      {showPricing && (
        <div className="border-t border-gray-200 pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Reservation Fee</span>
            <span className="text-gray-900">
              {formatCurrency(reservationFee)}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold">
            <span className="text-gray-900">Total</span>
            <span className="text-gray-900">{formatCurrency(total)}</span>
          </div>
        </div>
      )}
    </Card>
  );
};
