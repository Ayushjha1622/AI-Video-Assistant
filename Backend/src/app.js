import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import analysisRoutes from "./routes/analysis.routes.js";
import chatRoutes from "./routes/chat.routes.js";

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", process.env.FRONTEND_URL],
  credentials: true
}));

app.use(express.json());

// Add a root route so the deployed URL doesn't show "Cannot GET /"
app.get("/", (req, res) => {
  res.json({ message: "AI Video Assistant Backend is running!" });
});

app.use("/api/auth", authRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/chat", chatRoutes);

export default app;