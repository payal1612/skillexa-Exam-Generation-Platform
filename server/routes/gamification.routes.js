import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getGamificationStats,
  awardXpToUser,
  updateUserStreak,
  getLeaderboardByXp,
  getDailyRewards,
  claimDailyReward
} from '../controllers/gamificationController.js';

const router = express.Router();

// Get current user's gamification stats
router.get('/stats', protect, getGamificationStats);

// Get XP leaderboard
router.get('/leaderboard', protect, getLeaderboardByXp);

// Update user streak (called on login/activity)
router.post('/streak', protect, updateUserStreak);

// Get daily rewards status
router.get('/daily-rewards', protect, getDailyRewards);

// Claim daily reward
router.post('/daily-rewards/claim', protect, claimDailyReward);

// Admin: Award XP to user (for testing)
router.post('/award-xp', protect, awardXpToUser);

export default router;
