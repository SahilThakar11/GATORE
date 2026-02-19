import prisma from "../config/prisma";
import { Request, Response } from "express";

export const getRestaurants = async (req: Request, res: Response): Promise<void> => {
    try {
        const restaurants = await prisma.restaurant.findMany({
            include: {
                tables: true,
                games: true
            },
        });
        res.status(200).json({
            success: true,
            data: restaurants,
        });
    }
    catch (error) {
        console.error("Error fetching restaurants:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching restaurants. Please try again.",
        });
    }   
};

export const getReservations = async (req: Request, res: Response): Promise<void> => {
    try {
        const restaurantId = parseInt(req.params.restaurantId); // Assuming restaurantId is passed as a URL parameter
        const date = req.query.date as string; // Assuming date is passed as a query parameter
        const reservations = await prisma.reservation.findMany({
            where: { 
                table: {
                    restaurantId: restaurantId,
                },
                date: date
            },
            include: {
                restaurant: true,
                table: true,
            },
        });
        res.status(200).json({
            success: true,
            data: reservations,
        });
    }
    catch (error) {
        console.error("Error fetching reservations:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching reservations. Please try again.",
        });
    }
};