import express from 'express';
import {
  getInstructorStats,
  getInstructorExams,
  getInstructorStudents,
  getInstructorActivity,
  updateExamStatus,
  deleteExam,
  getInstructorAnalytics,
  exportStudentData
} from '../controllers/instructorController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes require instructor or admin role
router.use(protect);
router.use(authorize('instructor', 'admin'));

// Dashboard stats
router.get('/stats', getInstructorStats);

// Exams management
router.get('/exams', getInstructorExams);
router.put('/exams/:examId/status', updateExamStatus);
router.delete('/exams/:examId', deleteExam);

// Students
router.get('/students', getInstructorStudents);
router.get('/students/export', exportStudentData);

// Activity
router.get('/activity', getInstructorActivity);

// Analytics
router.get('/analytics', getInstructorAnalytics);

export default router;
