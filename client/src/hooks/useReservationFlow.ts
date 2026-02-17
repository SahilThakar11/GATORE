import { useState, useCallback } from "react";
import type {
  ReservationData,
  BookingDetails,
  UserDetails,
  PaymentDetails,
  Game,
} from "../types/reservation.types";
import {
  isValidEmail,
  isValidCardNumber,
  isValidExpiryDate,
  isValidCVV,
} from "../utils/validation";

export const useReservationFlow = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<ReservationData>({
    booking: null,
    user: null,
    payment: null,
    isGuest: false,
    isAuthenticated: false,
  });

  const updateBooking = useCallback((updates: Partial<BookingDetails>) => {
    setData((prev) => ({
      ...prev,
      booking: prev.booking
        ? { ...prev.booking, ...updates }
        : (updates as BookingDetails),
    }));
  }, []);

  const updateUser = useCallback((user: UserDetails) => {
    setData((prev) => ({ ...prev, user }));
  }, []);

  const updatePayment = useCallback((payment: PaymentDetails) => {
    setData((prev) => ({ ...prev, payment }));
  }, []);

  const selectGame = useCallback((game?: Game) => {
    setData((prev) => ({
      ...prev,
      booking: prev.booking ? { ...prev.booking, selectedGame: game } : null,
    }));
  }, []);

  const setAuthentication = useCallback(
    (isAuthenticated: boolean, isGuest: boolean) => {
      setData((prev) => ({ ...prev, isAuthenticated, isGuest }));
    },
    [],
  );

  const canProceed = useCallback((): boolean => {
    switch (currentStep) {
      case 0: // When step
        return !!(
          data.booking?.date &&
          data.booking?.time &&
          data.booking?.partySize
        );

      case 1: // Games step (optional)
        return true;

      case 2: // Account step
        return !!(data.user?.email && isValidEmail(data.user.email));

      case 3: // Payment step
        return !!(
          data.payment?.nameOnCard &&
          data.payment?.cardNumber &&
          isValidCardNumber(data.payment.cardNumber) &&
          data.payment?.expiryDate &&
          isValidExpiryDate(data.payment.expiryDate) &&
          data.payment?.cvv &&
          isValidCVV(data.payment.cvv)
        );

      case 4: // Auth step
        return data.isAuthenticated || data.isGuest;

      case 5: // Confirm step
        return true;

      default:
        return false;
    }
  }, [currentStep, data]);

  const nextStep = useCallback(() => {
    if (canProceed()) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    }
  }, [canProceed]);

  const prevStep = useCallback(() => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setCurrentStep(0);
    setData({
      booking: null,
      user: null,
      payment: null,
      isGuest: false,
      isAuthenticated: false,
    });
  }, []);

  return {
    currentStep,
    data,
    updateBooking,
    updateUser,
    updatePayment,
    selectGame,
    setAuthentication,
    nextStep,
    prevStep,
    canProceed: canProceed(),
    reset,
  };
};
