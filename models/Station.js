import mongoose from "mongoose";

const stationSchema = new mongoose.Schema(
  {
    cpo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CPO",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
    },

    address: {
      type: String,
      required: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    connectors: [
      {
        type: String,
        enum: ["Type2", "CCS", "CHAdeMO", "GB/T", "Tesla"],
      },
    ],

    powerKW: {
      type: Number,
      required: true,
    },

    pricePerKWh: {
      type: Number,
    },

    availabilityStatus: {
      type: String,
      enum: ["available", "busy", "offline"],
      default: "available",
    },

    images: [
      {
        type: String, // S3 URLs
      },
    ],

    averageRating: {
      type: Number,
      default: 0,
    },

    reviewCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Geo index
stationSchema.index({ location: "2dsphere" });

export default mongoose.models.Station ||
  mongoose.model("Station", stationSchema);