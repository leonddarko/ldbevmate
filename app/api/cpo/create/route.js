import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import User from "@/models/User";
import CPO from "@/models/CPO";
import mongoose from "mongoose";

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

        const userId = session.user.id;

        const { companyName, contactPhone, contactEmail } =
            await req.json();

        if (!companyName) {
            return NextResponse.json(
                { message: "Company name is required" },
                { status: 400 }
            );
        }

        // Prevent duplicate CPO
        const existingCPO = await CPO.findOne({ user: userId });
        if (existingCPO) {
            return NextResponse.json(
                { message: "CPO profile already exists" },
                { status: 400 }
            );
        }

        // Transaction for atomic safety
        const sessionDB = await mongoose.startSession();
        sessionDB.startTransaction();

        try {
            const newCPO = await CPO.create(
                [
                    {
                        user: userId,
                        companyName,
                        contactPhone,
                        contactEmail,
                        verified: false,
                    },
                ],
                { session: sessionDB }
            );

            await User.findByIdAndUpdate(
                userId,
                { role: "cpo" },
                { session: sessionDB }
            );

            await sessionDB.commitTransaction();
            sessionDB.endSession();

            return NextResponse.json(
                {
                    message: "CPO profile created successfully",
                    cpo: newCPO[0],
                    requiresRelogin: true, // important
                },
                { status: 201 }
            );
        } catch (err) {
            await sessionDB.abortTransaction();
            sessionDB.endSession();
            throw err;
        }

    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { message: "Server error" },
            { status: 500 }
        );
    }

}