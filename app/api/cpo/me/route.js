import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import CPO from "@/models/CPO";
import Station from "@/models/Station";

export async function GET() {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);

    console.log(session.user.role);
    

    if (!session) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // if (session.user.role !== "admin") {
    //   return NextResponse.json(
    //     { message: "Forbidden" },
    //     { status: 403 }
    //   );
    // }

    //     if (session.user.role !== "cpo") {
    //   return NextResponse.json(
    //     { message: "Forbidden" },
    //     { status: 403 }
    //   );
    // }

    const cpo = await CPO.findOne({ user: session.user.id })
      .populate("user", "name email");

      // console.log(cpo);

    if (!cpo) {
      return NextResponse.json(
        { message: "CPO profile not found" },
        { status: 404 }
      );
    }

    const stations = await Station.find({ cpo: cpo._id }).lean();
    

    return NextResponse.json({ cpo, stations }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}