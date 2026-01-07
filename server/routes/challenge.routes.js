import express from 'express';
import {
  getChallenges,
  getChallengeById,
  getChallengeStats,
  getUserChallenges,
  getChallengeLeaderboard,
  registerForChallenge,
  submitChallenge,
  generateChallenge,
  createChallenge,
  updateChallenge,
  deleteChallenge,
  seedChallenges
} from '../controllers/challengeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Seed route (no auth for initial setup)
router.post('/seed', protect, seedChallenges);

// Public routes (still need auth for user-specific data)
router.get('/', protect, getChallenges);
router.get('/stats', protect, getChallengeStats);
router.get('/my-challenges', protect, getUserChallenges);
router.get('/:id', protect, getChallengeById);
router.get('/:id/leaderboard', protect, getChallengeLeaderboard);

// User actions
router.post('/:id/register', protect, registerForChallenge);
router.post('/:id/submit', protect, submitChallenge);

// Generate challenge preview
router.post('/generate', protect, generateChallenge);

// Admin/Instructor routes
router.post('/', protect, createChallenge);
router.put('/:id', protect, updateChallenge);
router.delete('/:id', protect, deleteChallenge);

export default router;
