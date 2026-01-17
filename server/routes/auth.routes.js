import express from "express";
import {
  register,
  login,
  getCurrentUser,
  logout,
  updateSkillPreferences,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// Public Routes
router.post("/register", register);
router.post("/login", login);

// Private Routes
router.get("/me", protect, getCurrentUser);
router.post("/logout", protect, logout);
router.put("/skill-preferences", protect, updateSkillPreferences);

export default router;
