import express from 'express';
import { getProfile, updateProfile, getUserStats, getPublicProfile, changePassword } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, changePassword);
router.get('/stats', protect, getUserStats);
router.get('/public/:userId', getPublicProfile);

export default router;
