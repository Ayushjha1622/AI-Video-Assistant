import express from "express";
import {
  createAnalysis,
  getAnalyses,
  getAnalysisById,
} from "../controllers/analysis.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/", createAnalysis);
router.get("/", getAnalyses);
router.get("/:id", getAnalysisById);

export default router;
