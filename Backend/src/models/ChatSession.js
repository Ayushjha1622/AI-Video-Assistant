import mongoose from "mongoose";

const chatSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    analysisId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Analysis",
      required: true,
    },
    title: {
      type: String,
      default: "New Chat Session",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ChatSession", chatSessionSchema);
