import axios from "axios";
import ChatSession from "../models/ChatSession.js";
import ChatMessage from "../models/ChatMessage.js";
import Analysis from "../models/Analysis.js";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

export const createChatSession = async (req, res) => {
  try {
    const { analysisId, title } = req.body;

    if (!analysisId) {
      return res.status(400).json({ message: "analysisId is required" });
    }

    const analysis = await Analysis.findOne({ _id: analysisId, userId: req.user._id });
    if (!analysis) {
      return res.status(404).json({ message: "Analysis not found or unauthorized" });
    }

    const chatSession = await ChatSession.create({
      userId: req.user._id,
      analysisId,
      title: title || `Chat regarding ${analysis.title || "Video"}`,
    });

    res.status(201).json(chatSession);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getChatSessions = async (req, res) => {
  try {
    const { analysisId } = req.query;
    const filter = { userId: req.user._id };
    if (analysisId) {
      filter.analysisId = analysisId;
    }

    const sessions = await ChatSession.find(filter).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { chatSessionId, message } = req.body;

    if (!chatSessionId || !message) {
      return res.status(400).json({ message: "chatSessionId and message are required" });
    }

    const session = await ChatSession.findOne({ _id: chatSessionId, userId: req.user._id });
    if (!session) {
      return res.status(404).json({ message: "Chat session not found" });
    }

    const analysis = await Analysis.findById(session.analysisId);
    if (!analysis) {
      return res.status(404).json({ message: "Associated analysis not found" });
    }

    // 1. Save user's message
    const userMessage = await ChatMessage.create({
      chatSessionId,
      sender: "user",
      message,
    });

    // 2. Call FastAPI Chat Service
    try {
      const response = await axios.post(`${AI_SERVICE_URL}/api/chat/`, {
        analysis_id: analysis.vectorCollectionName || `analysis_${analysis._id}`,
        question: message,
      });

      const answer = response.data.answer || "No response received from the assistant.";

      // 3. Save AI's response
      const aiMessage = await ChatMessage.create({
        chatSessionId,
        sender: "ai",
        message: answer,
      });

      return res.status(201).json({
        userMessage,
        aiMessage,
      });
    } catch (apiError) {
      console.error("FastAPI Chat Error:", apiError.message);
      return res.status(502).json({
        message: "Failed to communicate with AI chat service",
        error: apiError.message,
      });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getChatMessages = async (req, res) => {
  try {
    const { id: chatSessionId } = req.params;

    const session = await ChatSession.findOne({ _id: chatSessionId, userId: req.user._id });
    if (!session) {
      return res.status(404).json({ message: "Chat session not found" });
    }

    const messages = await ChatMessage.find({ chatSessionId }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
