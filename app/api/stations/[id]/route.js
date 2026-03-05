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