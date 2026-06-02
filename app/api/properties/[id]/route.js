import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import connectDB from "@/lib/db";
import Property from "@/models/Property";
import Realtor from "@/models/Realtor";

// GET single property
export async function GET(req, { params }) {

    try {

        await connectDB();

        const property = await Property.findById(
            params.id
        ).populate(
            "realtor",
            "agencyName verified location"
        );

        if (!property) {

            return NextResponse.json(
                {
                    message: "Property not found",
                },
                {
                    status: 404,
                }
            );
        }

        return NextResponse.json(
            {
                property,
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

// DELETE property
export async function DELETE(req, context) {

    try {

        await connectDB();

        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized", },
                { status: 401, }
            );
        }


        const params = await context.params;
        const { id } = params;


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

        const property = await Property.findById(
            id
        );

        if (!property) {

            return NextResponse.json(
                {
                    message: "Property not found",
                },
                {
                    status: 404,
                }
            );
        }

        // Ownership check
        if (
            property.realtor.toString() !==
            realtor._id.toString()
        ) {

            return NextResponse.json(
                {
                    message:
                        "Not authorized to delete this property",
                },
                {
                    status: 403,
                }
            );
        }

        await Property.findByIdAndDelete(
            id
        );

        // decrement listing count
        await Realtor.findByIdAndUpdate(
            realtor._id,
            {
                $inc: {
                    totalListings: -1,
                },
            }
        );

        return NextResponse.json(
            {
                message:
                    "Property deleted successfully",
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

// PATCH (update property)
export async function PATCH(req, { params }) {

    try {

        await connectDB();

        const session = await getServerSession(
            authOptions
        );

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

        const property = await Property.findById(
            params.id
        );

        if (!property) {

            return NextResponse.json(
                {
                    message: "Property not found",
                },
                {
                    status: 404,
                }
            );
        }

        // Ownership check
        if (
            property.realtor.toString() !==
            realtor._id.toString()
        ) {

            return NextResponse.json(
                {
                    message:
                        "Not authorized to update this property",
                },
                {
                    status: 403,
                }
            );
        }

        const body = await req.json();

        const updated =
            await Property.findByIdAndUpdate(
                params.id,
                {
                    $set: body,
                },
                { new: true }
            );

        return NextResponse.json(
            {
                message:
                    "Property updated successfully",
                property: updated,
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