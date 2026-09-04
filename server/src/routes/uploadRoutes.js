import express from "express";
import upload from "../middleware/uploadMiddleware.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { uploadProfilePicture } from "../controllers/uploadController.js";

const router = express.Router();

router.post(
  "/profile-picture",
  authMiddleware,
  upload.single("image"),
  uploadProfilePicture
);

export default router;