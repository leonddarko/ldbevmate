import mongoose from "mongoose";

const InquirySchema = new mongoose.Schema({
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Property",
  },

  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  realtor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Realtor",
  },

  message: String,

  status: {
    type: String,
    enum: ["new", "contacted", "closed"],
    default: "new",
  },
}, { timestamps: true });

export default mongoose.models.Inquiry || mongoose.model("Inquiry", InquirySchema);