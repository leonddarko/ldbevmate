// app/api/reviews/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import Station from "@/models/Station";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

/**
 * POST /api/reviews
 * Create or update a user's review for a station
 */
export async function POST(req) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await req.json();
        const { station, rating, comment } = body;

        if (!station || !rating) {
            return NextResponse.json(
                { message: "Station and rating are required." },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { message: "Rating must be between 1 and 5." },
                { status: 400 }
            );
        }

        // Confirm station exists
        const existingStation = await Station.findById(station);
        if (!existingStation) {
            return NextResponse.json(
                { message: "Station not found." },
                { status: 404 }
            );
        }

        // Upsert review (one review per user per station)
        const review = await Review.findOneAndUpdate(
            {
                station,
                user: session.user.id,
            },
            {
                rating,
                comment,
            },
            {
                returnDocument: "after",
                upsert: true,
                setDefaultsOnInsert: true,
            }
        );

        // Recalculate station averages
        const allReviews = await Review.find({ station });

        const reviewCount = allReviews.length;
        const averageRating =
            reviewCount > 0
                ? allReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
                : 0;

        await Station.findByIdAndUpdate(station, {
            averageRating,
            reviewCount,
        });

        return NextResponse.json(review, { status: 201 });

    } catch (error) {
        console.error("POST review error:", error);

        return NextResponse.json(
            { message: "Failed to submit review." },
            { status: 500 }
        );
    }
}