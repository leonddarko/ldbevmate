// app/api/reviews/[stationId]/route.js
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Review from "@/models/Review";

/**
 * GET /api/reviews/:stationId
 * Fetch all reviews for a station
 */
export async function GET(req, { params }) {
    try {
        await connectDB();

        const { stationid } = await params;

        console.log(stationid);
        

        const reviews = await Review.find({
            station: stationid,
        })
            .populate("user", "name")
            .sort({ createdAt: -1 });

        return NextResponse.json(reviews);

    } catch (error) {
        console.error("GET reviews error:", error);

        return NextResponse.json(
            { message: "Failed to fetch reviews." },
            { status: 500 }
        );
    }
}