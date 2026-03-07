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
                userId: parseInt(userId),
                tableId: parseInt(tableId),
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

        const { date, restaurantId } = req.body;

        console.log("Query parameters:", date as string);

        const reservations = await prisma.reservation.findMany({
            where: { 
                reservationDate: date ? new Date(date as string) : undefined,
                table: {
                    restaurantId: restaurantId ? parseInt(restaurantId as string) : undefined,
                },
            },
            include: {
                table: true,
                gameReservations: {
                    include: {
                        game: true,
                    }
                }
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

export const getGames = async (req: Request, res: Response): Promise<void> => {
    try {
        const games = await prisma.game.findMany({
            where: {
                restaurantId: req.query.restaurantId ? parseInt(req.query.restaurantId as string) : undefined,
            }
        });
        res.json({
            success: true,
            message: "Games retrieved successfully",
            data: games,
        });
    } catch (error) {
        console.error("Get games error:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while retrieving games.",
        });
    }
};