import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getUsers } from "../controllers/userController.js";

const router = express.Router();

router.get("/", authMiddleware, getUsers);

router.get("/me", authMiddleware, (req, res) => {
  res.json({
    success: true,
    message: "Protected Route",
    user: req.user,
  });
});

export default router;
