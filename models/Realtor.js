import mongoose from "mongoose";

const RealtorSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    agencyName: {
        type: String,
        required: true,
        trim: true,
    },
    bio: String,
    phone: String,
    whatsapp: String,

    verified: {
        type: Boolean,
        default: false,
    },
    
    // verified: {
    //     type: String,
    //     enum: ["pending", "verified", "rejected"],
    //     default: "pending",
    // },

    profileImage: String,

    location: {
        city: String,
        region: String,
    },

    ratingsAverage: {
        type: Number,
        default: 0,
    },

    totalListings: {
        type: Number,
        default: 0,
    },
}, { timestamps: true });

export default mongoose.models.Realtor || mongoose.model("Realtor", RealtorSchema);