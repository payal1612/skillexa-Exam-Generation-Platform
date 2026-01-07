import mongoose from "mongoose";

/**
 * Testimonial Schema - Production-ready and scalable
 * Supports real-time updates, admin moderation, and rich testimonial data
 */
const testimonialSchema = new mongoose.Schema(
  {
    // User reference (who wrote the testimonial)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },

    // Cached user info for performance (denormalization)
    authorInfo: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      avatar: {
        type: String,
        default: null,
      },
      // Custom photo uploaded specifically for testimonial (optional)
      customPhoto: {
        type: String,
        default: null,
      },
      // Which photo to display: 'profile' uses user avatar, 'custom' uses customPhoto
      photoType: {
        type: String,
        enum: ["profile", "custom"],
        default: "profile",
      },
      role: {
        type: String,
        enum: ["user", "instructor", "admin"],
        default: "user",
      },
      title: {
        type: String,
        trim: true,
        maxlength: 100,
      },
      company: {
        type: String,
        trim: true,
        maxlength: 100,
      },
      location: {
        type: String,
        trim: true,
        maxlength: 100,
      },
    },

    // Testimonial content
    content: {
      type: String,
      required: [true, "Testimonial content is required"],
      trim: true,
      minlength: [20, "Testimonial must be at least 20 characters"],
      maxlength: [1000, "Testimonial cannot exceed 1000 characters"],
    },

    // Short headline/title for the testimonial
    headline: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    // Rating (1-5 stars)
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      default: 5,
    },

    // Category/Type of testimonial
    category: {
      type: String,
      enum: [
        "general",
        "course_quality",
        "skill_development",
        "career_growth",
        "platform_experience",
        "instructor_quality",
        "certification",
        "support",
      ],
      default: "general",
      index: true,
    },

    // Related entities (optional references)
    relatedTo: {
      type: {
        type: String,
        enum: ["skill", "exam", "course", "certificate", "instructor"],
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: "relatedTo.type",
      },
      name: String,
    },

    // Moderation/Admin control
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "featured", "archived"],
      default: "pending",
      index: true,
    },

    // Admin moderation details
    moderation: {
      moderatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      moderatedAt: Date,
      rejectionReason: String,
      notes: String,
    },

    // Featured testimonial settings
    featured: {
      isFeatured: {
        type: Boolean,
        default: false,
        index: true,
      },
      featuredAt: Date,
      featuredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      priority: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      displayOrder: {
        type: Number,
        default: 0,
      },
    },

    // Engagement metrics
    engagement: {
      views: {
        type: Number,
        default: 0,
      },
      likes: {
        type: Number,
        default: 0,
      },
      helpful: {
        type: Number,
        default: 0,
      },
      shares: {
        type: Number,
        default: 0,
      },
    },

    // Users who interacted
    likedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    helpfulBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // Media attachments
    media: [
      {
        type: {
          type: String,
          enum: ["image", "video"],
        },
        url: String,
        thumbnail: String,
        alt: String,
      },
    ],

    // Tags for filtering
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    // Source of testimonial
    source: {
      type: String,
      enum: ["platform", "import", "api", "social"],
      default: "platform",
    },

    // For imported testimonials
    externalId: {
      type: String,
      sparse: true,
    },

    // Visibility settings
    visibility: {
      isPublic: {
        type: Boolean,
        default: true,
      },
      showOnHomepage: {
        type: Boolean,
        default: true,
      },
      showOnProfile: {
        type: Boolean,
        default: true,
      },
    },

    // Verification
    verified: {
      isVerified: {
        type: Boolean,
        default: false,
      },
      verifiedAt: Date,
      verificationMethod: {
        type: String,
        enum: ["email", "manual", "auto", "certificate"],
      },
    },

    // Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Version for optimistic locking
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for efficient queries
testimonialSchema.index({ status: 1, createdAt: -1 });
testimonialSchema.index({ "featured.isFeatured": 1, "featured.priority": -1 });
testimonialSchema.index({ rating: -1, createdAt: -1 });
testimonialSchema.index({ category: 1, status: 1 });
testimonialSchema.index({ user: 1, status: 1 });
testimonialSchema.index({ tags: 1 });
testimonialSchema.index({ createdAt: -1 });
testimonialSchema.index({ "engagement.likes": -1 });

// Text index for search
testimonialSchema.index(
  {
    content: "text",
    headline: "text",
    "authorInfo.name": "text",
    tags: "text",
  },
  {
    weights: {
      headline: 10,
      "authorInfo.name": 5,
      content: 3,
      tags: 2,
    },
  }
);

// Virtual for formatted date
testimonialSchema.virtual("formattedDate").get(function () {
  return this.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Virtual for display photo (returns the appropriate image based on photoType)
testimonialSchema.virtual("displayPhoto").get(function () {
  if (this.authorInfo.photoType === "custom" && this.authorInfo.customPhoto) {
    return this.authorInfo.customPhoto;
  }
  return this.authorInfo.avatar;
});

// Virtual for engagement score
testimonialSchema.virtual("engagementScore").get(function () {
  return (
    this.engagement.views * 0.1 +
    this.engagement.likes * 2 +
    this.engagement.helpful * 3 +
    this.engagement.shares * 5
  );
});

// Pre-save middleware
testimonialSchema.pre("save", function (next) {
  // Increment version on update
  if (!this.isNew) {
    this.version += 1;
  }

  // Auto-set featured date
  if (this.featured.isFeatured && !this.featured.featuredAt) {
    this.featured.featuredAt = new Date();
  }

  next();
});

// Static method: Get approved testimonials with pagination
testimonialSchema.statics.getApproved = async function (options = {}) {
  const {
    page = 1,
    limit = 10,
    category = null,
    sortBy = "createdAt",
    sortOrder = -1,
  } = options;

  const query = {
    status: { $in: ["approved", "featured"] },
    isDeleted: false,
    "visibility.isPublic": true,
  };

  if (category && category !== "all") {
    query.category = category;
  }

  const skip = (page - 1) * limit;

  const [testimonials, total] = await Promise.all([
    this.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query),
  ]);

  return {
    testimonials,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  };
};

// Static method: Get featured testimonials
testimonialSchema.statics.getFeatured = async function (limit = 6) {
  return this.find({
    "featured.isFeatured": true,
    status: "featured",
    isDeleted: false,
    "visibility.isPublic": true,
  })
    .sort({ "featured.priority": -1, "featured.displayOrder": 1 })
    .limit(limit)
    .lean();
};

// Static method: Get testimonial statistics
testimonialSchema.statics.getStats = async function () {
  const stats = await this.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: {
          $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
        },
        approved: {
          $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
        },
        featured: {
          $sum: { $cond: [{ $eq: ["$status", "featured"] }, 1, 0] },
        },
        rejected: {
          $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
        },
        averageRating: { $avg: "$rating" },
        totalLikes: { $sum: "$engagement.likes" },
        totalViews: { $sum: "$engagement.views" },
      },
    },
  ]);

  return stats[0] || {
    total: 0,
    pending: 0,
    approved: 0,
    featured: 0,
    rejected: 0,
    averageRating: 0,
    totalLikes: 0,
    totalViews: 0,
  };
};

// Static method: Get category distribution
testimonialSchema.statics.getCategoryStats = async function () {
  return this.aggregate([
    { $match: { isDeleted: false, status: { $in: ["approved", "featured"] } } },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// Instance method: Approve testimonial
testimonialSchema.methods.approve = async function (moderatorId, notes = "") {
  this.status = "approved";
  this.moderation = {
    moderatedBy: moderatorId,
    moderatedAt: new Date(),
    notes,
  };
  return this.save();
};

// Instance method: Reject testimonial
testimonialSchema.methods.reject = async function (moderatorId, reason = "") {
  this.status = "rejected";
  this.moderation = {
    moderatedBy: moderatorId,
    moderatedAt: new Date(),
    rejectionReason: reason,
  };
  return this.save();
};

// Instance method: Feature testimonial
testimonialSchema.methods.feature = async function (adminId, priority = 50) {
  this.status = "featured";
  this.featured = {
    isFeatured: true,
    featuredAt: new Date(),
    featuredBy: adminId,
    priority,
  };
  return this.save();
};

// Instance method: Unfeature testimonial
testimonialSchema.methods.unfeature = async function () {
  this.featured.isFeatured = false;
  this.status = "approved";
  return this.save();
};

// Instance method: Toggle like
testimonialSchema.methods.toggleLike = async function (userId) {
  const userIdStr = userId.toString();
  const index = this.likedBy.findIndex((id) => id.toString() === userIdStr);

  if (index > -1) {
    this.likedBy.splice(index, 1);
    this.engagement.likes = Math.max(0, this.engagement.likes - 1);
  } else {
    this.likedBy.push(userId);
    this.engagement.likes += 1;
  }

  return this.save();
};

// Instance method: Mark as helpful
testimonialSchema.methods.markHelpful = async function (userId) {
  const userIdStr = userId.toString();
  if (!this.helpfulBy.find((id) => id.toString() === userIdStr)) {
    this.helpfulBy.push(userId);
    this.engagement.helpful += 1;
    return this.save();
  }
  return this;
};

// Instance method: Increment views
testimonialSchema.methods.incrementViews = async function () {
  this.engagement.views += 1;
  return this.save();
};

// Instance method: Soft delete
testimonialSchema.methods.softDelete = async function (userId) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;
  return this.save();
};

const Testimonial = mongoose.model("Testimonial", testimonialSchema);

export default Testimonial;
