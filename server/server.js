import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./config/database.js";
import { logger } from "./utils/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import skillRoutes from "./routes/skill.routes.js";
import examRoutes from "./routes/exam.routes.js";
import examGenRoutes from "./routes/examGen.routes.js";
import certificateRoutes from "./routes/certificate.routes.js";
import achievementRoutes from "./routes/achievement.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import chatbotRoutes from "./routes/chatbot.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import instructorRoutes from "./routes/instructor.routes.js";
import challengeRoutes from "./routes/challenge.routes.js";
import careerRoutes from "./routes/career.routes.js";
import gamificationRoutes from "./routes/gamification.routes.js";
import testimonialRoutes from "./routes/testimonial.routes.js";

// Load environment variables (project root .env)
const __dirname = path.dirname(new URL(import.meta.url).pathname);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Read required values
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Create Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS – allow frontend to communicate
app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
  })
);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect Database
connectDB();

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/exam", examGenRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/instructor", instructorRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/career", careerRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/testimonials", testimonialRoutes);

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "SkillExa API",
      version: "1.0.0",
      description: "API documentation for SkillExa",
    },
    servers: [
      {
        url: "http://localhost:5000",
      },
    ],
  },
  apis: ["./server/routes/*.js"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Error handler (always last)
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`🌍 Frontend allowed: ${CLIENT_URL}`);
  logger.info(`🗄️ MongoDB: ${process.env.MONGODB_URI}`);
});
