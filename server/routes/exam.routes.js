import express from 'express';
import { getAllExams, getExamById, createExam, submitExam, getExamResults, getUserExamResults, generateExam, submitGeneratedExamResults } from '../controllers/examController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /generate:
 *   post:
 *     summary: Generate a new exam
 *     tags: [Exams]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               skill:
 *                 type: string
 *                 description: Skill for the exam
 *               difficulty:
 *                 type: string
 *                 description: Difficulty level
 *               questionCount:
 *                 type: integer
 *                 description: Number of questions
 *     responses:
 *       201:
 *         description: Exam successfully generated
 *       400:
 *         description: Invalid input
 */

router.get('/', getAllExams);
router.get('/user/results', protect, getUserExamResults);
router.post('/submit', protect, submitGeneratedExamResults); // For AI-generated exams
router.get('/:id', getExamById);
router.post('/', protect, authorize('instructor', 'admin'), createExam);
router.post('/:examId/submit', protect, submitExam);
router.get('/:examId/results', protect, getExamResults);
// Allow any authenticated user to generate an exam
router.post('/generate', protect, generateExam);

export default router;
