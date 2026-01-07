import express from "express";
import { protect, authorize } from "../middleware/auth.js";
import {
  // Public endpoints
  getTestimonials,
  getFeaturedTestimonials,
  getTestimonialById,
  getPublicStats,
  
  // Authenticated user endpoints
  createTestimonial,
  updateTestimonial,
  deleteOwnTestimonial,
  getMyTestimonials,
  toggleLikeTestimonial,
  markHelpful,
  
  // Admin endpoints
  getAllTestimonialsAdmin,
  getAdminStats,
  approveTestimonial,
  rejectTestimonial,
  featureTestimonial,
  unfeatureTestimonial,
  deleteTestimonialAdmin,
  bulkUpdateTestimonials,
  updateDisplayOrder,
  restoreTestimonial,
} from "../controllers/testimonialController.js";

const router = express.Router();

// ================================
// PUBLIC ROUTES (No auth required)
// ================================

// Get approved testimonials with pagination
router.get("/", getTestimonials);

// Get featured testimonials for homepage
router.get("/featured", getFeaturedTestimonials);

// Get public statistics
router.get("/stats", getPublicStats);

// Get single testimonial by ID (public)
router.get("/view/:id", getTestimonialById);

// ================================
// AUTHENTICATED USER ROUTES
// ================================

// Get user's own testimonials
router.get("/user/my", protect, getMyTestimonials);

// Create new testimonial
router.post("/", protect, createTestimonial);

// Update own testimonial
router.put("/:id", protect, updateTestimonial);

// Delete own testimonial
router.delete("/:id", protect, deleteOwnTestimonial);

// Like/Unlike testimonial
router.post("/:id/like", protect, toggleLikeTestimonial);

// Mark testimonial as helpful
router.post("/:id/helpful", protect, markHelpful);

// ================================
// ADMIN ROUTES
// ================================

// Get all testimonials with filters (admin)
router.get("/admin/all", protect, authorize("admin"), getAllTestimonialsAdmin);

// Get admin statistics
router.get("/admin/stats", protect, authorize("admin"), getAdminStats);

// Bulk update testimonials
router.put("/admin/bulk-update", protect, authorize("admin"), bulkUpdateTestimonials);

// Approve testimonial
router.put("/admin/:id/approve", protect, authorize("admin"), approveTestimonial);

// Reject testimonial
router.put("/admin/:id/reject", protect, authorize("admin"), rejectTestimonial);

// Feature testimonial
router.put("/admin/:id/feature", protect, authorize("admin"), featureTestimonial);

// Unfeature testimonial
router.put("/admin/:id/unfeature", protect, authorize("admin"), unfeatureTestimonial);

// Update display order
router.put("/admin/:id/order", protect, authorize("admin"), updateDisplayOrder);

// Restore deleted testimonial
router.put("/admin/:id/restore", protect, authorize("admin"), restoreTestimonial);

// Delete testimonial (admin)
router.delete("/admin/:id", protect, authorize("admin"), deleteTestimonialAdmin);

export default router;
