import mongoose from "mongoose";

const usageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tokensUsed: {
      type: Number,
      default: 0,
    },
    apiCalls: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Usage", usageSchema);
