import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectDB from "@/lib/db";

import Realtor from "@/models/Realtor";
import Property from "@/models/Property";

import AddPropertyModal from "@/components/ui/AddPropertyModal";
import RealtorPropertyCard from "@/components/ui/RealtorPropertyCard";

export default async function PropertiesPage() {

    const session = await getServerSession(authOptions);

    if (!session) {

        return (
            <div className="p-6 text-red-600">
                Unauthorized
            </div>
        );
    }

    await connectDB();

    // Find realtor profile
    const realtor = await Realtor.findOne({
        user: session.user.id,
    });

    if (!realtor) {

        return (
            <div className="p-6 text-red-600">
                Realtor profile not found
            </div>
        );
    }

    // Fetch properties
    const properties = await Property.find({
        realtor: realtor._id,
    })
        .sort({ createdAt: -1 })
        .lean();

    const Properties = JSON.parse(
        JSON.stringify(properties)
    );

    return (
        <div
            className="
                py-6 md:pt-12
                px-4 md:px-10
                h-screen
                rounded-3xl
                bg-blue-50/50
                backdrop-blur-sm
                border border-white/90
                overflow-scroll
            "
        >
            {/* Header */}
            <div
                className="
                    flex justify-between
                    items-center
                    mb-10
                "
            >
                <h1
                    className="
                        text-3xl
                        text-blue-950
                        font-bold
                    "
                >
                    Your Properties
                </h1>

                <AddPropertyModal />

            </div>

            {/* Content */}

            {Properties.length === 0 ? (
                <div className="text-blue-900/60 text-sm">
                    No properties yet. Add your first listing.
                </div>
            ) : (
                <RealtorPropertyCard
                    Properties={Properties.reverse()}
                />
            )}

        </div>
    );
}