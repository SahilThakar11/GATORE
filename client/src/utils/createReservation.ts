import type { ReservationData } from "../types/reservation.types";


export const handleConfirmReservation = async (data: ReservationData, nextStep: () => void, setLoading: (loading: boolean) => void) => {
    
    let error = "";

	try {

        setLoading(true);

		if (!data.booking || !data.user) {
			error = "Missing booking or user information";
			return error;
		}

		const reservationData = {
			reservationDate: data.booking.date,
			startTime: data.booking.time,
			endTime: data.booking.time, // You may want to calculate this
			partySize: data.booking.partySize,
			userId: 1, // Replace with actual user ID from auth
			tableId: 1, // Replace with actual table ID selection
		};

		const response = await fetch("http://localhost:3000/api/reservations", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(reservationData),
		});

		const result = await response.json();

		if (!response.ok) {
			throw new Error(result.message || "Failed to create reservation");
		}

		// Success - move to next step
		nextStep();
	} catch (err) {
		error = err instanceof Error
				? err.message
				: "An error occurred during reservation";
	} finally {
		setLoading(false);
	}

    return error;
};
