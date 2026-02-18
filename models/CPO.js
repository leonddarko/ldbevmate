import mongoose from "mongoose";

const cpoSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    companyName: {
      type: String,
      required: true,
      trim: true,
    },
    contactPhone: {
      type: String,
    },
    contactEmail: {
      type: String,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.CPO || mongoose.model("CPO", cpoSchema);