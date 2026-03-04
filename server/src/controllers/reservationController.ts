import prisma from "../config/prisma";
import { Request, Response } from "express";

export const createReservation = async (req: Request, res: Response): Promise<void> => {
    try {
        const { 
            reservationDate, 
            startTime, 
            endTime, 
            partySize, 
            userId, 
            tableId } = req.body;

        const reservation = await prisma.reservation.create({
            data: {
                reservationDate: new Date(reservationDate),
                startTime: new Date(reservationDate + " " + startTime),
                endTime: new Date(reservationDate + " " + endTime), // This should be calculated based on the restaurant's reservation duration policy
                partySize: parseInt(partySize),
                userId: 9,
                tableId: 2,
                status: "PENDING",
            },
        });

        res.status(201).json({
            success: true,
            message: "Reservation created successfully",
            data: reservation,
        });
    } catch (error) {
        console.error("Reservation creation error:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred during reservation creation. Please try again.",
        });
    }
};

export const getReservations = async (req: Request, res: Response): Promise<void> => {
    try {
        const reservations = await prisma.reservation.findMany({
            where: { 
                reservationDate: req.query.date ? new Date(req.query.date as string) : undefined,
                table: {
                    restaurantId: req.query.restaurantId ? parseInt(req.query.restaurantId as string) : undefined,
                }
            },
            include: {
                table: true,
            },
        });

        res.json({

            success: true,
            message: "Reservations retrieved successfully",
            data: reservations,
        });
    } catch (error) {
        console.error("Get reservations error:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while retrieving reservations.",
        });
    }
};
