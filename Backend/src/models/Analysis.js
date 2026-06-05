import mongoose from "mongoose";

const analysisSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sourceType: {
      type: String,
      enum: ["youtube", "audio", "video"],
      required: true,
    },

    sourceUrl: String,
    videoUrl: String,

    title: {
      type: String,
      required: true,
    },

    transcriptLength: {
      type: Number,
      default: 0,
    },

    summary: {
      type: String,
      required: true,
    },

    actionItems: [
      {
        type: String,
      },
    ],

    keyDecisions: [
      {
        type: String,
      },
    ],

    openQuestions: [
      {
        type: String,
      },
    ],

    processingTime: Number,

    vectorCollectionName: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "processing",
        "completed",
        "failed"
      ],
      default: "processing",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "Analysis",
  analysisSchema
);