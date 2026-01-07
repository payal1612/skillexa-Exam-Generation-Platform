import express from 'express';
import { getLeaderboard, getUserRank, getSkillLeaderboard, getTopAchievers, getPlatformStats } from '../controllers/leaderboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getLeaderboard);
router.get('/stats', getPlatformStats);
router.get('/rank/:userId', getUserRank);
router.get('/skill/:skillId', getSkillLeaderboard);
router.get('/top-achievers', getTopAchievers);

export default router;
