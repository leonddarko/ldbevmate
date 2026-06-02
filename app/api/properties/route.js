import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

import connectDB from "@/lib/db";

import Property from "@/models/Property";
import Realtor from "@/models/Realtor";

export async function POST(req) {

    try {

        await connectDB();

        const session = await getServerSession(authOptions);

        // Auth check
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

        // Role check
        if (session.user.role !== "realtor") {

            return NextResponse.json(
                {
                    message:
                        "Only Realtors can add properties",
                },
                {
                    status: 403,
                }
            );
        }

        const body = await req.json();

        const {
            title,
            description,
            type,
            listingType,
            price,
            bedrooms,
            bathrooms,
            area,
            address,
            amenities,
            featured,
            location,
        } = body;

        // Validation
        if (
            !title ||
            !type ||
            !listingType ||
            !price ||
            !address ||
            !location
        ) {

            return NextResponse.json(
                {
                    message:
                        "Missing required fields",
                },
                {
                    status: 400,
                }
            );
        }

        // Find Realtor profile
        const realtor = await Realtor.findOne({
            user: session.user.id,
        });

        if (!realtor) {

            return NextResponse.json(
                {
                    message:
                        "Realtor profile not found",
                },
                {
                    status: 404,
                }
            );
        }

        // Create property
        const property = await Property.create({

            realtor: realtor._id,

            title,

            description,

            type,

            listingType,

            price,

            bedrooms,

            bathrooms,

            area,

            address,

            amenities,

            featured,

            verified: false,

            location,
        });

        // Increment listing count
        await Realtor.findByIdAndUpdate(
            realtor._id,
            {
                $inc: {
                    totalListings: 1,
                },
            }
        );

        return NextResponse.json(
            {
                message:
                    "Property created successfully",

                property,
            },
            {
                status: 201,
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

// Optional GET endpoint
export async function GET() {

    try {

        await connectDB();

        const properties = await Property.find()
            .populate(
                "realtor",
                "agencyName verified location"
            )
            .sort({
                createdAt: -1,
            });

        return NextResponse.json(
            {
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