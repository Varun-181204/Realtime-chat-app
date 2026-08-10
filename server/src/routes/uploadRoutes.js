import express from "express";
import upload from "../middleware/upload.js";
import { uploadProfilePicture } from "../controllers/uploadController.js";

const router = express.Router();

router.post(
  "/profile-picture",
  upload.single("image"),
  uploadProfilePicture
);

export default router;