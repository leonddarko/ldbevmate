import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Station from "@/models/Station";
import CPO from "@/models/CPO";

const VALID_CONNECTORS = ["Type2", "CCS", "CHAdeMO", "GB/T", "Tesla"];
const VALID_STATUS = ["available", "busy", "offline"];

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

    const {
      cpo,
      name,
      description,
      address,
      location,
      connectors,
      powerKW,
      pricePerKWh,
      availabilityStatus,
    } = body;

    console.log(body);
    

    // // Basic validation
    // if (!name || !address || !location || !powerKW) {
    //   return NextResponse.json(
    //     { message: "Missing required fields" },
    //     { status: 400 }
    //   );
    // }

    // if (
    //   location.type !== "Point" ||
    //   !Array.isArray(location.coordinates) ||
    //   location.coordinates.length !== 2
    // ) {
    //   return NextResponse.json(
    //     { message: "Invalid location format" },
    //     { status: 400 }
    //   );
    // }

    // // Validate connectors
    // if (connectors?.some((c) => !VALID_CONNECTORS.includes(c))) {
    //   return NextResponse.json(
    //     { message: "Invalid connector type" },
    //     { status: 400 }
    //   );
    // }

    // // Validate availability
    // if (
    //   availabilityStatus &&
    //   !VALID_STATUS.includes(availabilityStatus)
    // ) {
    //   return NextResponse.json(
    //     { message: "Invalid availability status" },
    //     { status: 400 }
    //   );
    // }

    // // 🔐 SECURITY: Ensure user owns this CPO
    // const cpoDoc = await CPO.findById(cpo);

    // if (!cpoDoc) {
    //   return NextResponse.json(
    //     { message: "CPO not found" },
    //     { status: 404 }
    //   );
    // }

    // if (cpoDoc.user.toString() !== session.user.id) {
    //   return NextResponse.json(
    //     { message: "Forbidden" },
    //     { status: 403 }
    //   );
    // }

    // const station = await Station.create({
    //   cpo,
    //   name,
    //   description,
    //   address,
    //   location,
    //   connectors,
    //   powerKW,
    //   pricePerKWh,
    //   availabilityStatus,
    // });

    return NextResponse.json(
      { message: "Station created" },
      // { message: "Station created", station },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}