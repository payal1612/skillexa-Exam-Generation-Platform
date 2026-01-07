import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  // Dashboard
  getDashboardStats,
  
  // Users
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  resetUserPassword,
  deleteUser,
  bulkDeleteUsers,
  exportUsers,
  
  // Exams
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  bulkUpdateExamStatus,
  
  // Exam Results
  getAllExamResults,
  deleteExamResult,
  
  // Skills
  getAllSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  
  // Certificates
  getAllCertificates,
  getCertificateById,
  revokeCertificate,
  deleteCertificate,
  
  // Achievements
  getAllAchievements,
  createAchievement,
  updateAchievement,
  deleteAchievement,
  
  // Analytics
  getAnalytics,
  
  // System
  getSystemInfo,
  getRecentActivity
} from '../controllers/adminController.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

// ==================== DASHBOARD ====================
router.get('/stats', getDashboardStats);

// ==================== USERS ====================
router.get('/users', getAllUsers);
router.get('/users/export', exportUsers);
router.get('/users/:id', getUserById);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.put('/users/:id/reset-password', resetUserPassword);
router.delete('/users/:id', deleteUser);
router.post('/users/bulk-delete', bulkDeleteUsers);

// ==================== EXAMS ====================
router.get('/exams', getAllExams);
router.get('/exams/:id', getExamById);
router.post('/exams', createExam);
router.put('/exams/:id', updateExam);
router.delete('/exams/:id', deleteExam);
router.post('/exams/bulk-status', bulkUpdateExamStatus);

// ==================== EXAM RESULTS ====================
router.get('/results', getAllExamResults);
router.delete('/results/:id', deleteExamResult);

// ==================== SKILLS ====================
router.get('/skills', getAllSkills);
router.post('/skills', createSkill);
router.put('/skills/:id', updateSkill);
router.delete('/skills/:id', deleteSkill);

// ==================== CERTIFICATES ====================
router.get('/certificates', getAllCertificates);
router.get('/certificates/:id', getCertificateById);
router.put('/certificates/:id/revoke', revokeCertificate);
router.delete('/certificates/:id', deleteCertificate);

// ==================== ACHIEVEMENTS ====================
router.get('/achievements', getAllAchievements);
router.post('/achievements', createAchievement);
router.put('/achievements/:id', updateAchievement);
router.delete('/achievements/:id', deleteAchievement);

// ==================== ANALYTICS ====================
router.get('/analytics', getAnalytics);

// ==================== SYSTEM ====================
router.get('/system', getSystemInfo);
router.get('/activity', getRecentActivity);

export default router;
