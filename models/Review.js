import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    station: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Station",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    comment: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Prevent duplicate reviews per user per station
reviewSchema.index({ station: 1, user: 1 }, { unique: true });

export default mongoose.models.Review ||
  mongoose.model("Review", reviewSchema);