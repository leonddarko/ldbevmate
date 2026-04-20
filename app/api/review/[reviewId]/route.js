import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Review from "@/models/Review";
import Station from "@/models/Station";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function DELETE(req, context) {
    try {
        await connectDB();

        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const params = await context.params;
        const { reviewId } = params;

        const review = await Review.findById(reviewId);

        if (!review) {
            return NextResponse.json(
                { message: "Review not found" },
                { status: 404 }
            );
        }

        // Only owner can delete
        if (review.user.toString() !== session.user.id) {
            return NextResponse.json(
                { message: "Forbidden" },
                { status: 403 }
            );
        }

        const stationId = review.station;

        await Review.findByIdAndDelete(reviewId);

        // Recalculate station rating
        const remainingReviews = await Review.find({
            station: stationId,
        });

        const reviewCount = remainingReviews.length;

        const averageRating =
            reviewCount > 0
                ? remainingReviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
                : 0;

        await Station.findByIdAndUpdate(stationId, {
            averageRating,
            reviewCount,
        });

        return NextResponse.json({ message: "Review deleted" });

    } catch (error) {
        console.error("DELETE review error:", error);

        return NextResponse.json(
            { message: "Failed to delete review" },
            { status: 500 }
        );
    }
}