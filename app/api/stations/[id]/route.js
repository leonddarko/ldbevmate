import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Station from "@/models/Station";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function DELETE(req, context) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { params } = context;
  const { id } = await params; // ✅ unwrap params

  await connectDB();

  await Station.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}


export async function GET(req, context) {

  const { params } = context;
  const { id } = await params; // ✅ unwrap params

  await connectDB();

  const station = await Station.findById(id);

  return NextResponse.json({ station });
}


export async function PUT(req) {

  try {
    await connectDB();
    const body = await req.json();

    const updatedStation = await Station.findByIdAndUpdate(
      body.id,
      {
        name: body.name,
        description: body.description,
        address: body.address,

        location: {
          type: "Point",
          coordinates: [body.longitude, body.latitude],
        },

        connectors: body.connectors,
        powerKW: body.powerKW,
        pricePerKWh: body.pricePerKWh,
        outlets: body.outlets,
        availabilityStatus: body.availabilityStatus,
      },
      { new: true }
    );

    return NextResponse.json({ station: updatedStation });

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update station" },
      { status: 500 }
    );
  }
}