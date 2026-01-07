import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import User from "../models/User.js"; // <-- load full user model

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// =============================
//   AUTH PROTECT MIDDLEWARE
// =============================
export const protect = async (req, res, next) => {
  let token;

  try {
    // Check Authorization: Bearer xyz...
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    // No token?
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized — Token missing",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch full user object (NOT just id)
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found — invalid token",
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized — Token expired or invalid",
    });
  }
};

// =============================
//   ROLE-BASED AUTHORIZATION
// =============================
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden — You do not have permission",
      });
    }

    next();
  };
};
