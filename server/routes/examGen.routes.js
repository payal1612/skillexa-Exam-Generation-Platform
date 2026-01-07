import express from 'express';
import { generateExamAi } from '../controllers/examGenerateController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// POST /api/exam/generate - authenticated exam generation
router.post('/generate', protect, generateExamAi);

export default router;
