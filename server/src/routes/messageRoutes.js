import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  sendMessage,
  getMessages,
  markMessagesAsSeen,
  deleteMessage,
  editMessage,
  getUnreadCounts,
  getRecentConversations,
  toggleReaction,
} from "../controllers/messageController.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  upload.fields([
  {
    name: "image",
    maxCount: 1,
  },
  {
    name: "document",
    maxCount: 1,
  },
]),
  sendMessage
);

router.get("/unread", authMiddleware, getUnreadCounts);

router.get("/conversations/recent", authMiddleware, getRecentConversations);

router.post("/:messageId/react", authMiddleware, toggleReaction);

router.patch("/:messageId", authMiddleware, editMessage);

router.get("/:receiverId", authMiddleware, getMessages);

router.patch("/seen/:senderId", authMiddleware, markMessagesAsSeen);

router.delete("/:messageId", authMiddleware, deleteMessage);

export default router;