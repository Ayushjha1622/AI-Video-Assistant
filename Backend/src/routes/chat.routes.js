import express from "express";
import {
  createChatSession,
  getChatSessions,
  sendMessage,
  getChatMessages,
} from "../controllers/chat.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(protect);

router.post("/session", createChatSession);
router.get("/sessions", getChatSessions);
router.post("/message", sendMessage);
router.get("/messages/:id", getChatMessages);

export default router;
