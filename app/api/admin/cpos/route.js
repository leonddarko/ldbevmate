import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import CPO from "@/models/CPO";

export async function GET() {
  try {
    await connectDB();

    const cpos = await CPO.find()
      .populate("user", "name email role")
      .sort({ createdAt: -1 });

    return NextResponse.json(cpos);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch CPOs" },
      { status: 500 }
    );
  }
}