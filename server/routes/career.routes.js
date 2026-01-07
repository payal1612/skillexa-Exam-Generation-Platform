import express from 'express';
import {
  generateRoadmap,
  getUserRoadmaps,
  getRoadmapById,
  updateMilestone,
  updateExam,
  updateCourse,
  getCareerPaths,
  deleteRoadmap,
  registerForSession,
  getSessionZoomDetails
} from '../controllers/careerController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get available career paths (no auth needed for browsing)
router.get('/paths', protect, getCareerPaths);

// Generate new roadmap
router.post('/generate', protect, generateRoadmap);

// Get user's roadmaps
router.get('/my-roadmaps', protect, getUserRoadmaps);

// Get single roadmap
router.get('/:id', protect, getRoadmapById);

// Update milestone
router.put('/:id/milestone', protect, updateMilestone);

// Update exam
router.put('/:id/exam', protect, updateExam);

// Update course
router.put('/:id/course', protect, updateCourse);

// Register for live session
router.post('/:id/session/register', protect, registerForSession);

// Get session Zoom details
router.get('/:id/session/:sessionId', protect, getSessionZoomDetails);

// Delete roadmap
router.delete('/:id', protect, deleteRoadmap);

export default router;
