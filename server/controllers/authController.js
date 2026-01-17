import User from "../models/User.js";
import { generateToken } from "../utils/tokenUtils.js";

// =========================
// REGISTER USER
// =========================
export const register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Required field validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    // Password match check
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Existing user check
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Create user
    const user = await User.create({ name, email, password });

    // Generate token
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        knownSkills: user.knownSkills || [],
        skillsToLearn: user.skillsToLearn || [],
        hasCompletedOnboarding: user.hasCompletedOnboarding || false
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================
// LOGIN USER
// =========================
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Field validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user with password field
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Password verification
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        knownSkills: user.knownSkills || [],
        skillsToLearn: user.skillsToLearn || [],
        hasCompletedOnboarding: user.hasCompletedOnboarding || false
      },
    });
  } catch (error) {
    next(error);
  }
};

// =========================
// GET CURRENT USER
// =========================
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// =========================
// LOGOUT USER
// =========================
export const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// =========================
// UPDATE SKILL PREFERENCES (Onboarding)
// =========================
export const updateSkillPreferences = async (req, res, next) => {
  try {
    const { knownSkills, skillsToLearn } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        knownSkills: knownSkills || [],
        skillsToLearn: skillsToLearn || [],
        hasCompletedOnboarding: true
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Skill preferences updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        knownSkills: user.knownSkills,
        skillsToLearn: user.skillsToLearn,
        hasCompletedOnboarding: user.hasCompletedOnboarding
      }
    });
  } catch (error) {
    next(error);
  }
};
