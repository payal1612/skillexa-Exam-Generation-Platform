import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\S+@\S+\.\S+$/,
        "Please enter a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // ensures not returned automatically
    },

    role: {
      type: String,
      enum: ["user", "instructor", "admin"],
      default: "user",
    },

    avatar: { type: String, trim: true },
    bio: { type: String, trim: true },

    stats: {
      examsCompleted: { type: Number, default: 0 },
      examsPassed: { type: Number, default: 0 },
      certificatesEarned: { type: Number, default: 0 },
      skillsLearned: { type: Number, default: 0 },
      totalPoints: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
    },

    // Gamification fields
    gamification: {
      xp: { type: Number, default: 0 },
      level: { type: Number, default: 1 },
      currentStreak: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
      lastActivityDate: { type: Date },
      dailyXpEarned: { type: Number, default: 0 },
      dailyXpDate: { type: Date },
      weeklyXp: { type: Number, default: 0 },
      weeklyXpStartDate: { type: Date },
      totalChallengesCompleted: { type: Number, default: 0 },
      achievementsUnlocked: { type: Number, default: 0 },
      rank: { type: String, default: 'Beginner' },
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt auto
  }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);

  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
