import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "../../auth/[...nextauth]/route";

import connectDB from "@/lib/db";

import User from "@/models/User";
import Realtor from "@/models/Realtor";

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

        const {
            agencyName,
            bio,
            phone,
            whatsapp,
            city,
            region,
        } = await req.json();

        if (!agencyName || !phone) {
            return NextResponse.json(
                {
                    message:
                        "Agency name and phone are required",
                },
                { status: 400 }
            );
        }

        // Prevent duplicate Realtor profiles
        const existingRealtor = await Realtor.findOne({
            user: userId,
        });

        if (existingRealtor) {
            return NextResponse.json(
                {
                    message:
                        "Realtor profile already exists",
                },
                { status: 400 }
            );
        }

        // Transaction
        const sessionDB = await mongoose.startSession();

        sessionDB.startTransaction();

        try {
            const newRealtor = await Realtor.create(
                [
                    {
                        user: userId,

                        agencyName,
                        bio,
                        phone,
                        whatsapp,

                        location: {
                            city,
                            region,
                        },

                        verified: false,
                    },
                ],
                {
                    session: sessionDB,
                }
            );

            // Update user role
            await User.findByIdAndUpdate(
                userId,
                {
                    role: "realtor",
                },
                {
                    session: sessionDB,
                }
            );

            await sessionDB.commitTransaction();

            sessionDB.endSession();

            return NextResponse.json(
                {
                    message:
                        "Realtor profile created successfully",

                    realtor: newRealtor[0],

                    requiresRelogin: true,
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
            {
                message: "Server error",
            },
            { status: 500 }
        );
    }
}