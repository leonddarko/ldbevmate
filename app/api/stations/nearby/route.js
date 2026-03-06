import connectDB from "@/lib/db";
import Station from "@/models/Station";

export async function GET(req) {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const lat = parseFloat(searchParams.get("lat"));
    const lng = parseFloat(searchParams.get("lng"));
    const radius = parseInt(searchParams.get("radius")) || 5000; // meters

    if (!lat || !lng) {
        return Response.json(
            { error: "Latitude and longitude required" },
            { status: 400 }
        );
    }

    try {
        const stations = await Station.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [lng, lat], // IMPORTANT: [lng, lat]
                    },
                    $maxDistance: radius,
                },
            },
        })
            .limit(50)
            .lean();

        return Response.json(stations);
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }

}