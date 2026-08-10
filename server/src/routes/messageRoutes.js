import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  sendMessage,
  getMessages,
  markMessagesAsSeen,
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

router.get("/:receiverId", authMiddleware, getMessages);

router.patch("/seen/:senderId", authMiddleware, markMessagesAsSeen);


export default router;