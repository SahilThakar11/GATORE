import React from "react";
import { MapPin, Calendar } from "lucide-react";
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
        <div className="w-10 h-10 rounded-full bg-white border border-warm-700 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-5 h-5 text-warm-700" />
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
        <div className="w-10 h-10 rounded-full bg-warm-700 flex items-center justify-center flex-shrink-0">
          <Calendar className="w-5 h-5 text-white" />
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
        <div className="w-10 h-10 rounded-full bg-warm-700 flex items-center justify-center flex-shrink-0">
          <img
            src="/icons/pawn.svg"
            alt=""
            aria-hidden="true"
            className="w-5 h-5 object-contain"
            style={{ filter: "brightness(0) invert(1)" }}
          />
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
          <div className="w-10 h-10 rounded-full bg-warm-700 flex items-center justify-center flex-shrink-0 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M2.578 8.174a.327.327 0 0 0-.328.326v8c0 .267.143.514.373.648l8.04 4.69a.391.391 0 0 0 .587-.338v-7.75a.99.99 0 0 0-.492-.855L2.742 8.217a.33.33 0 0 0-.164-.043m2.176 2.972a1 1 0 0 1 .389.067c.168.067.27.149.367.234c.192.171.343.372.48.61c.138.238.236.466.287.718c.026.127.046.259.02.438a.89.89 0 0 1-.422.642a.89.89 0 0 1-.768.045a1.2 1.2 0 0 1-.367-.236a2.4 2.4 0 0 1-.48-.607a2.4 2.4 0 0 1-.287-.721a1.2 1.2 0 0 1-.02-.438a.89.89 0 0 1 .422-.642a.8.8 0 0 1 .379-.11m3.25 1.702a1 1 0 0 1 .389.064c.168.067.27.151.367.236c.192.171.343.37.48.608c.138.238.236.468.287.72c.026.127.046.259.02.438a.89.89 0 0 1-.422.643a.9.9 0 0 1-.768.043a1.2 1.2 0 0 1-.367-.235a2.4 2.4 0 0 1-.48-.61a2.4 2.4 0 0 1-.287-.718a1.2 1.2 0 0 1-.02-.437a.89.89 0 0 1 .422-.643a.8.8 0 0 1 .379-.11m-3.25 1.5a1 1 0 0 1 .389.064c.168.067.27.151.367.236c.192.171.343.37.48.608c.138.238.236.468.287.72c.026.127.046.259.02.438a.89.89 0 0 1-.422.643a.9.9 0 0 1-.768.043a1.2 1.2 0 0 1-.367-.235a2.4 2.4 0 0 1-.48-.61a2.4 2.4 0 0 1-.287-.718a1.2 1.2 0 0 1-.02-.437a.89.89 0 0 1 .422-.643a.8.8 0 0 1 .379-.11m3.25 1.75a1 1 0 0 1 .389.064c.168.067.27.151.367.236c.192.171.343.37.48.608c.138.238.236.468.287.72c.026.127.046.259.02.438a.89.89 0 0 1-.422.643a.9.9 0 0 1-.768.043a1.2 1.2 0 0 1-.367-.235a2.4 2.4 0 0 1-.48-.61a2.4 2.4 0 0 1-.287-.718a1.2 1.2 0 0 1-.02-.437a.89.89 0 0 1 .422-.643a.8.8 0 0 1 .379-.11m13.443-7.924a.33.33 0 0 0-.19.043l-8.015 4.678a.99.99 0 0 0-.492.855v7.799a.363.363 0 0 0 .547.312l8.08-4.713a.75.75 0 0 0 .373-.648v-8a.327.327 0 0 0-.303-.326m-5.502 4.707a.83.83 0 0 1 .43.111a.89.89 0 0 1 .422.643c.026.179.006.311-.02.437c-.051.253-.15.481-.287.719a2.4 2.4 0 0 1-.48.61a1.2 1.2 0 0 1-.367.234a.89.89 0 0 1-.768-.043a.89.89 0 0 1-.422-.643a1.2 1.2 0 0 1 .02-.437c.051-.253.15-.483.287-.721s.288-.437.48-.607c.097-.086.2-.17.367-.237a1 1 0 0 1 .338-.066m3.25 1.5a.83.83 0 0 1 .43.111a.89.89 0 0 1 .422.643c.026.179.006.311-.02.437c-.051.253-.15.481-.287.719a2.4 2.4 0 0 1-.48.61a1.2 1.2 0 0 1-.367.234a.89.89 0 0 1-.768-.043a.89.89 0 0 1-.422-.643a1.2 1.2 0 0 1 .02-.437c.051-.253.15-.483.287-.721s.288-.437.48-.607c.097-.086.2-.17.367-.237a1 1 0 0 1 .338-.066M12 1.5a.74.74 0 0 0-.377.102L3.533 6.32a.36.36 0 0 0 0 .623l7.74 4.516a1.44 1.44 0 0 0 1.454 0l7.765-4.531a.343.343 0 0 0 0-.592l-8.115-4.734A.75.75 0 0 0 12 1.5m-.094 4.078h.102c.274 0 .523.03.767.111c.123.041.247.091.39.204a.89.89 0 0 1 .343.685a.89.89 0 0 1-.344.686a1.2 1.2 0 0 1-.389.203a2.4 2.4 0 0 1-.767.111c-.275 0-.523-.03-.768-.111a1.2 1.2 0 0 1-.388-.203a.89.89 0 0 1-.344-.686c0-.338.201-.573.344-.685a1.2 1.2 0 0 1 .388-.204a2.3 2.3 0 0 1 .666-.11" strokeWidth="0.4" stroke="currentColor"/>
            </svg>
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
      {/* TODO: Hook up café pricing model here. The venue's pricingType, coverFee, hourlyRate,
          enableThreshold, and minSpend should be fetched as part of the venue/restaurant data
          and passed into this component. Replace the hardcoded reservationFee ($6) with the
          real pricing breakdown — e.g. flat cover fee per person, hourly rate estimate based
          on a typical session length, or hybrid of both. Show the threshold waiver note if
          enableThreshold is true and the customer's spend qualifies. */}
      {showPricing && (
        <div className="border-t border-warm-200 pt-4 space-y-2">
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
