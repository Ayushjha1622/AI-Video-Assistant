import mongoose from "mongoose";
import axios from "axios";
import Analysis from "../models/Analysis.js";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

export const createAnalysis = async (req, res) => {
  try {
    const { videoUrl, language = "english" } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ message: "videoUrl is required" });
    }

    // Determine sourceType and pre-generate _id for vector collection name
    const isYoutube = videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be");
    const sourceType = isYoutube ? "youtube" : "audio";
    
    const analysisId = new mongoose.Types.ObjectId();
    const collectionName = `analysis_${analysisId}`;

    // 1. Create the Analysis document satisfying all required schema fields
    const analysis = await Analysis.create({
      _id: analysisId,
      userId: req.user._id,
      sourceType,
      sourceUrl: videoUrl,
      videoUrl: videoUrl,
      title: "Analyzing...",
      summary: "Analyzing transcription...",
      vectorCollectionName: collectionName,
      status: "processing",
      actionItems: [],
      keyDecisions: [],
      openQuestions: [],
    });

    // 2. Call FastAPI AI Service
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/analyze/`, {
        source: videoUrl,
        language,
        collection_name: collectionName,
      });

      if (response.data && response.data.success) {
        const { title, summary, action_items, decisions, questions } = response.data.data;

        analysis.title = title || "Untitled Analysis";
        analysis.summary = summary || "No summary generated.";
        analysis.actionItems = action_items || [];
        analysis.keyDecisions = decisions || [];
        analysis.openQuestions = questions || [];
        analysis.status = "completed";
        await analysis.save();

        return res.status(201).json(analysis);
      } else {
        analysis.status = "failed";
        await analysis.save();
        return res.status(500).json({ message: "Failed to process video analysis in AI Service" });
      }
    } catch (apiError) {
      console.error("FastAPI connection error:", apiError.message);
      analysis.status = "failed";
      await analysis.save();
      return res.status(502).json({
        message: "Failed to communicate with AI Service microservice",
        error: apiError.message,
      });
    }
  } catch (error) {
    console.error("Error creating analysis:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAnalyses = async (req, res) => {
  try {
    const analyses = await Analysis.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAnalysisById = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.user._id });
    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found" });
    }
    res.json(analysis);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
