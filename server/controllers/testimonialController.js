import Testimonial from "../models/Testimonial.js";
import User from "../models/User.js";
import { logger } from "../utils/logger.js";

// =========================
// PUBLIC ENDPOINTS
// =========================

/**
 * Get approved testimonials (public)
 * GET /api/testimonials
 */
export const getTestimonials = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      category = "all",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const result = await Testimonial.getApproved({
      page: parseInt(page),
      limit: parseInt(limit),
      category,
      sortBy,
      sortOrder: sortOrder === "asc" ? 1 : -1,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    logger.error("Get testimonials error:", error);
    next(error);
  }
};

/**
 * Get featured testimonials (public)
 * GET /api/testimonials/featured
 */
export const getFeaturedTestimonials = async (req, res, next) => {
  try {
    const { limit = 6 } = req.query;
    const testimonials = await Testimonial.getFeatured(parseInt(limit));

    res.status(200).json({
      success: true,
      testimonials,
    });
  } catch (error) {
    logger.error("Get featured testimonials error:", error);
    next(error);
  }
};

/**
 * Get single testimonial (public)
 * GET /api/testimonials/:id
 */
export const getTestimonialById = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findOne({
      _id: req.params.id,
      status: { $in: ["approved", "featured"] },
      isDeleted: false,
    });

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    // Increment views
    await testimonial.incrementViews();

    res.status(200).json({
      success: true,
      testimonial,
    });
  } catch (error) {
    logger.error("Get testimonial by ID error:", error);
    next(error);
  }
};

/**
 * Get testimonial statistics (public)
 * GET /api/testimonials/stats
 */
export const getPublicStats = async (req, res, next) => {
  try {
    const [stats, categoryStats] = await Promise.all([
      Testimonial.getStats(),
      Testimonial.getCategoryStats(),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalApproved: stats.approved + stats.featured,
        averageRating: Math.round(stats.averageRating * 10) / 10,
        totalLikes: stats.totalLikes,
        categories: categoryStats,
      },
    });
  } catch (error) {
    logger.error("Get public stats error:", error);
    next(error);
  }
};

// =========================
// AUTHENTICATED ENDPOINTS
// =========================

/**
 * Create testimonial (authenticated users)
 * POST /api/testimonials
 */
export const createTestimonial = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check for existing pending/approved testimonial
    const existingTestimonial = await Testimonial.findOne({
      user: userId,
      status: { $in: ["pending", "approved", "featured"] },
      isDeleted: false,
    });

    if (existingTestimonial) {
      return res.status(400).json({
        success: false,
        message: "You already have an active testimonial. Please edit or delete it first.",
      });
    }

    const { content, headline, rating, category, title, company, location, tags, customPhoto, photoType } = req.body;

    // Validate required fields
    if (!content || !rating) {
      return res.status(400).json({
        success: false,
        message: "Content and rating are required",
      });
    }

    const testimonial = await Testimonial.create({
      user: userId,
      authorInfo: {
        name: user.name,
        avatar: user.avatar,
        customPhoto: customPhoto || null,
        photoType: photoType || "profile",
        role: user.role,
        title: title || "",
        company: company || "",
        location: location || "",
      },
      content,
      headline: headline || "",
      rating: parseInt(rating),
      category: category || "general",
      tags: tags || [],
      status: "pending", // Requires admin approval
    });

    logger.info(`New testimonial created by user ${userId}`);

    res.status(201).json({
      success: true,
      message: "Testimonial submitted successfully! It will be visible after admin approval.",
      testimonial,
    });
  } catch (error) {
    logger.error("Create testimonial error:", error);
    next(error);
  }
};

/**
 * Update own testimonial (authenticated users)
 * PUT /api/testimonials/:id
 */
export const updateTestimonial = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const testimonialId = req.params.id;

    const testimonial = await Testimonial.findOne({
      _id: testimonialId,
      user: userId,
      isDeleted: false,
    });

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found or you don't have permission to edit it",
      });
    }

    const { content, headline, rating, category, title, company, location, tags, customPhoto, photoType } = req.body;

    // Update fields
    if (content) testimonial.content = content;
    if (headline !== undefined) testimonial.headline = headline;
    if (rating) testimonial.rating = parseInt(rating);
    if (category) testimonial.category = category;
    if (tags) testimonial.tags = tags;

    // Update author info if provided
    if (title !== undefined) testimonial.authorInfo.title = title;
    if (company !== undefined) testimonial.authorInfo.company = company;
    if (location !== undefined) testimonial.authorInfo.location = location;
    if (customPhoto !== undefined) testimonial.authorInfo.customPhoto = customPhoto;
    if (photoType !== undefined) testimonial.authorInfo.photoType = photoType;

    // Reset to pending if content changed
    if (content && testimonial.status !== "pending") {
      testimonial.status = "pending";
    }

    await testimonial.save();

    res.status(200).json({
      success: true,
      message: "Testimonial updated successfully",
      testimonial,
    });
  } catch (error) {
    logger.error("Update testimonial error:", error);
    next(error);
  }
};

/**
 * Delete own testimonial (authenticated users)
 * DELETE /api/testimonials/:id
 */
export const deleteOwnTestimonial = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const testimonialId = req.params.id;

    const testimonial = await Testimonial.findOne({
      _id: testimonialId,
      user: userId,
      isDeleted: false,
    });

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found or you don't have permission to delete it",
      });
    }

    await testimonial.softDelete(userId);

    res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  } catch (error) {
    logger.error("Delete own testimonial error:", error);
    next(error);
  }
};

/**
 * Get user's own testimonials
 * GET /api/testimonials/my
 */
export const getMyTestimonials = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const testimonials = await Testimonial.find({
      user: userId,
      isDeleted: false,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      testimonials,
    });
  } catch (error) {
    logger.error("Get my testimonials error:", error);
    next(error);
  }
};

/**
 * Like/Unlike testimonial
 * POST /api/testimonials/:id/like
 */
export const toggleLikeTestimonial = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const testimonialId = req.params.id;

    const testimonial = await Testimonial.findOne({
      _id: testimonialId,
      status: { $in: ["approved", "featured"] },
      isDeleted: false,
    });

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    await testimonial.toggleLike(userId);

    const isLiked = testimonial.likedBy.some(
      (id) => id.toString() === userId.toString()
    );

    res.status(200).json({
      success: true,
      isLiked,
      likes: testimonial.engagement.likes,
    });
  } catch (error) {
    logger.error("Toggle like testimonial error:", error);
    next(error);
  }
};

/**
 * Mark testimonial as helpful
 * POST /api/testimonials/:id/helpful
 */
export const markHelpful = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const testimonialId = req.params.id;

    const testimonial = await Testimonial.findOne({
      _id: testimonialId,
      status: { $in: ["approved", "featured"] },
      isDeleted: false,
    });

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    await testimonial.markHelpful(userId);

    res.status(200).json({
      success: true,
      helpful: testimonial.engagement.helpful,
    });
  } catch (error) {
    logger.error("Mark helpful error:", error);
    next(error);
  }
};

// =========================
// ADMIN ENDPOINTS
// =========================

/**
 * Get all testimonials (admin)
 * GET /api/testimonials/admin/all
 */
export const getAllTestimonialsAdmin = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = "all",
      category = "all",
      search = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = { isDeleted: false };

    if (status !== "all") {
      query.status = status;
    }

    if (category !== "all") {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [testimonials, total] = await Promise.all([
      Testimonial.find(query)
        .populate("user", "name email avatar")
        .populate("moderation.moderatedBy", "name")
        .populate("featured.featuredBy", "name")
        .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Testimonial.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      testimonials,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    logger.error("Get all testimonials admin error:", error);
    next(error);
  }
};

/**
 * Get testimonial statistics (admin)
 * GET /api/testimonials/admin/stats
 */
export const getAdminStats = async (req, res, next) => {
  try {
    const [stats, categoryStats, recentActivity] = await Promise.all([
      Testimonial.getStats(),
      Testimonial.getCategoryStats(),
      Testimonial.find({ isDeleted: false })
        .sort({ createdAt: -1 })
        .limit(5)
        .select("authorInfo.name status createdAt rating"),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        ...stats,
        averageRating: Math.round(stats.averageRating * 10) / 10,
      },
      categoryStats,
      recentActivity,
    });
  } catch (error) {
    logger.error("Get admin stats error:", error);
    next(error);
  }
};

/**
 * Approve testimonial (admin)
 * PUT /api/testimonials/admin/:id/approve
 */
export const approveTestimonial = async (req, res, next) => {
  try {
    const adminId = req.user._id;
    const testimonialId = req.params.id;
    const { notes } = req.body;

    const testimonial = await Testimonial.findById(testimonialId);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    await testimonial.approve(adminId, notes);

    logger.info(`Testimonial ${testimonialId} approved by admin ${adminId}`);

    res.status(200).json({
      success: true,
      message: "Testimonial approved successfully",
      testimonial,
    });
  } catch (error) {
    logger.error("Approve testimonial error:", error);
    next(error);
  }
};

/**
 * Reject testimonial (admin)
 * PUT /api/testimonials/admin/:id/reject
 */
export const rejectTestimonial = async (req, res, next) => {
  try {
    const adminId = req.user._id;
    const testimonialId = req.params.id;
    const { reason } = req.body;

    const testimonial = await Testimonial.findById(testimonialId);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    await testimonial.reject(adminId, reason);

    logger.info(`Testimonial ${testimonialId} rejected by admin ${adminId}`);

    res.status(200).json({
      success: true,
      message: "Testimonial rejected",
      testimonial,
    });
  } catch (error) {
    logger.error("Reject testimonial error:", error);
    next(error);
  }
};

/**
 * Feature testimonial (admin)
 * PUT /api/testimonials/admin/:id/feature
 */
export const featureTestimonial = async (req, res, next) => {
  try {
    const adminId = req.user._id;
    const testimonialId = req.params.id;
    const { priority = 50 } = req.body;

    const testimonial = await Testimonial.findById(testimonialId);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    await testimonial.feature(adminId, priority);

    logger.info(`Testimonial ${testimonialId} featured by admin ${adminId}`);

    res.status(200).json({
      success: true,
      message: "Testimonial featured successfully",
      testimonial,
    });
  } catch (error) {
    logger.error("Feature testimonial error:", error);
    next(error);
  }
};

/**
 * Unfeature testimonial (admin)
 * PUT /api/testimonials/admin/:id/unfeature
 */
export const unfeatureTestimonial = async (req, res, next) => {
  try {
    const testimonialId = req.params.id;

    const testimonial = await Testimonial.findById(testimonialId);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    await testimonial.unfeature();

    res.status(200).json({
      success: true,
      message: "Testimonial unfeatured",
      testimonial,
    });
  } catch (error) {
    logger.error("Unfeature testimonial error:", error);
    next(error);
  }
};

/**
 * Delete testimonial (admin)
 * DELETE /api/testimonials/admin/:id
 */
export const deleteTestimonialAdmin = async (req, res, next) => {
  try {
    const adminId = req.user._id;
    const testimonialId = req.params.id;

    const testimonial = await Testimonial.findById(testimonialId);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    await testimonial.softDelete(adminId);

    logger.info(`Testimonial ${testimonialId} deleted by admin ${adminId}`);

    res.status(200).json({
      success: true,
      message: "Testimonial deleted successfully",
    });
  } catch (error) {
    logger.error("Delete testimonial admin error:", error);
    next(error);
  }
};

/**
 * Bulk update testimonials status (admin)
 * PUT /api/testimonials/admin/bulk-update
 */
export const bulkUpdateTestimonials = async (req, res, next) => {
  try {
    const adminId = req.user._id;
    const { testimonialIds, action } = req.body;

    if (!testimonialIds || !Array.isArray(testimonialIds) || !action) {
      return res.status(400).json({
        success: false,
        message: "Testimonial IDs and action are required",
      });
    }

    const validActions = ["approve", "reject", "feature", "unfeature", "delete"];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action",
      });
    }

    let updateData = {};
    switch (action) {
      case "approve":
        updateData = {
          status: "approved",
          "moderation.moderatedBy": adminId,
          "moderation.moderatedAt": new Date(),
        };
        break;
      case "reject":
        updateData = {
          status: "rejected",
          "moderation.moderatedBy": adminId,
          "moderation.moderatedAt": new Date(),
        };
        break;
      case "feature":
        updateData = {
          status: "featured",
          "featured.isFeatured": true,
          "featured.featuredBy": adminId,
          "featured.featuredAt": new Date(),
        };
        break;
      case "unfeature":
        updateData = {
          status: "approved",
          "featured.isFeatured": false,
        };
        break;
      case "delete":
        updateData = {
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: adminId,
        };
        break;
    }

    const result = await Testimonial.updateMany(
      { _id: { $in: testimonialIds } },
      { $set: updateData }
    );

    logger.info(
      `Bulk ${action} performed on ${result.modifiedCount} testimonials by admin ${adminId}`
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} testimonials updated`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    logger.error("Bulk update testimonials error:", error);
    next(error);
  }
};

/**
 * Update testimonial display order (admin)
 * PUT /api/testimonials/admin/:id/order
 */
export const updateDisplayOrder = async (req, res, next) => {
  try {
    const testimonialId = req.params.id;
    const { displayOrder, priority } = req.body;

    const testimonial = await Testimonial.findById(testimonialId);

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    if (displayOrder !== undefined) {
      testimonial.featured.displayOrder = displayOrder;
    }
    if (priority !== undefined) {
      testimonial.featured.priority = priority;
    }

    await testimonial.save();

    res.status(200).json({
      success: true,
      message: "Display order updated",
      testimonial,
    });
  } catch (error) {
    logger.error("Update display order error:", error);
    next(error);
  }
};

/**
 * Restore deleted testimonial (admin)
 * PUT /api/testimonials/admin/:id/restore
 */
export const restoreTestimonial = async (req, res, next) => {
  try {
    const testimonialId = req.params.id;

    const testimonial = await Testimonial.findByIdAndUpdate(
      testimonialId,
      {
        isDeleted: false,
        deletedAt: null,
        deletedBy: null,
        status: "pending",
      },
      { new: true }
    );

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: "Testimonial not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Testimonial restored successfully",
      testimonial,
    });
  } catch (error) {
    logger.error("Restore testimonial error:", error);
    next(error);
  }
};
