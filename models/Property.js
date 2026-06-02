import mongoose from "mongoose";

const PropertySchema = new mongoose.Schema({
  realtor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Realtor",
    required: true,
  },

  title: String,

  description: String,

  type: {
    type: String,
    enum: [
      "house",
      "apartment",
      "land",
      "office",
      "shop",
      "warehouse"
    ]
  },

  listingType: {
    type: String,
    enum: ["sale", "rent"],
  },

  price: Number,

  bedrooms: Number,
  bathrooms: Number,

  area: Number,

  images: [String],

  amenities: [String],

  address: String,

  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },

    coordinates: {
      type: [Number], // [lng, lat]
      required: true,
    },
  },

  featured: {
    type: Boolean,
    default: false,
  },

  verified: {
    type: Boolean,
    default: false,
  },

  views: {
    type: Number,
    default: 0,
  },

  status: {
    type: String,
    enum: ["available", "sold", "rented"],
    default: "available",
  },
}, { timestamps: true });

// Geospatial indexing:
PropertySchema.index({ location: "2dsphere" });

export default mongoose.models.Property ||
  mongoose.model("Property", PropertySchema);