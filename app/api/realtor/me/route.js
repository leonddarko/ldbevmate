import { NextResponse } from "next/server";

import { getServerSession } from "next-auth";

import { authOptions } from "../../auth/[...nextauth]/route";

import connectDB from "@/lib/db";

import Realtor from "@/models/Realtor";
import Property from "@/models/Property";

export async function GET() {

    try {

        await connectDB();

        const session = await getServerSession(authOptions);

        if (!session) {

            return NextResponse.json(
                {
                    message: "Unauthorized",
                },
                {
                    status: 401,
                }
            );
        }

        // Ensure user is a realtor
        if (session.user.role !== "realtor") {

            return NextResponse.json(
                {
                    message: "Access denied",
                },
                {
                    status: 403,
                }
            );
        }

        const userId = session.user.id;

        // Get realtor profile
        const realtor = await Realtor.findOne({
            user: userId,
        });

        if (!realtor) {

            return NextResponse.json(
                {
                    message: "Realtor profile not found",
                },
                {
                    status: 404,
                }
            );
        }

        // Get realtor properties
        const properties = await Property.find({
            realtor: realtor._id,
        })
            .sort({
                createdAt: -1,
            });

        return NextResponse.json(
            {
                realtor,
                properties,
            },
            {
                status: 200,
            }
        );

    } catch (error) {

        console.error(error);

        return NextResponse.json(
            {
                message: "Server error",
            },
            {
                status: 500,
            }
        );
    }
}