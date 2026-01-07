// Gamification utility functions

// XP required for each level (exponential growth)
export const XP_PER_LEVEL = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  1000,   // Level 5
  1750,   // Level 6
  2750,   // Level 7
  4000,   // Level 8
  5500,   // Level 9
  7500,   // Level 10
  10000,  // Level 11
  13000,  // Level 12
  16500,  // Level 13
  20500,  // Level 14
  25000,  // Level 15
  30000,  // Level 16
  36000,  // Level 17
  43000,  // Level 18
  51000,  // Level 19
  60000,  // Level 20
];

// XP rewards for different actions
export const XP_REWARDS = {
  EXAM_COMPLETED: 50,
  EXAM_PASSED: 100,
  PERFECT_SCORE: 200,
  FIRST_EXAM: 150,
  STREAK_BONUS_3: 50,
  STREAK_BONUS_7: 150,
  STREAK_BONUS_30: 500,
  CHALLENGE_COMPLETED: 100,
  CHALLENGE_WON: 300,
  ACHIEVEMENT_UNLOCKED: 75,
  CERTIFICATE_EARNED: 200,
  DAILY_LOGIN: 10,
  SKILL_MASTERED: 150,
};

// Rank titles based on level
export const RANKS = [
  { minLevel: 1, name: 'Beginner', color: '#9CA3AF' },
  { minLevel: 3, name: 'Apprentice', color: '#10B981' },
  { minLevel: 5, name: 'Skilled', color: '#3B82F6' },
  { minLevel: 8, name: 'Expert', color: '#8B5CF6' },
  { minLevel: 12, name: 'Master', color: '#F59E0B' },
  { minLevel: 15, name: 'Grandmaster', color: '#EF4444' },
  { minLevel: 18, name: 'Legend', color: '#EC4899' },
  { minLevel: 20, name: 'Mythic', color: '#6366F1' },
];

// Calculate level from XP
export const calculateLevel = (xp) => {
  for (let i = XP_PER_LEVEL.length - 1; i >= 0; i--) {
    if (xp >= XP_PER_LEVEL[i]) {
      return i + 1;
    }
  }
  return 1;
};

// Get XP needed for next level
export const getXpForNextLevel = (currentLevel) => {
  if (currentLevel >= XP_PER_LEVEL.length) {
    return XP_PER_LEVEL[XP_PER_LEVEL.length - 1] + (currentLevel - XP_PER_LEVEL.length + 1) * 10000;
  }
  return XP_PER_LEVEL[currentLevel];
};

// Get current level progress percentage
export const getLevelProgress = (xp, level) => {
  const currentLevelXp = XP_PER_LEVEL[level - 1] || 0;
  const nextLevelXp = getXpForNextLevel(level);
  const xpInCurrentLevel = xp - currentLevelXp;
  const xpNeededForLevel = nextLevelXp - currentLevelXp;
  return Math.min(100, Math.round((xpInCurrentLevel / xpNeededForLevel) * 100));
};

// Get rank based on level
export const getRank = (level) => {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (level >= RANKS[i].minLevel) {
      return RANKS[i];
    }
  }
  return RANKS[0];
};

// Check and update daily streak
export const updateStreak = (user) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const lastActivity = user.gamification?.lastActivityDate 
    ? new Date(user.gamification.lastActivityDate)
    : null;
  
  if (lastActivity) {
    lastActivity.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Same day, no streak change
      return { streakUpdated: false, newStreak: user.gamification.currentStreak };
    } else if (diffDays === 1) {
      // Consecutive day, increase streak
      const newStreak = (user.gamification.currentStreak || 0) + 1;
      return { 
        streakUpdated: true, 
        newStreak,
        longestStreak: Math.max(newStreak, user.gamification.longestStreak || 0)
      };
    } else {
      // Streak broken, reset to 1
      return { streakUpdated: true, newStreak: 1, streakBroken: true };
    }
  }
  
  // First activity ever
  return { streakUpdated: true, newStreak: 1 };
};

// Calculate bonus XP based on streak
export const getStreakBonus = (streak) => {
  if (streak >= 30) return XP_REWARDS.STREAK_BONUS_30;
  if (streak >= 7) return XP_REWARDS.STREAK_BONUS_7;
  if (streak >= 3) return XP_REWARDS.STREAK_BONUS_3;
  return 0;
};

// Award XP to user and handle level ups
export const awardXp = async (user, xpAmount, reason = 'activity') => {
  const oldLevel = user.gamification?.level || 1;
  const newXp = (user.gamification?.xp || 0) + xpAmount;
  const newLevel = calculateLevel(newXp);
  const leveledUp = newLevel > oldLevel;
  
  // Update user gamification stats
  user.gamification = {
    ...user.gamification,
    xp: newXp,
    level: newLevel,
    rank: getRank(newLevel).name,
    lastActivityDate: new Date()
  };
  
  // Update daily XP
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dailyXpDate = user.gamification.dailyXpDate 
    ? new Date(user.gamification.dailyXpDate)
    : null;
  
  if (dailyXpDate) {
    dailyXpDate.setHours(0, 0, 0, 0);
    if (dailyXpDate.getTime() === today.getTime()) {
      user.gamification.dailyXpEarned = (user.gamification.dailyXpEarned || 0) + xpAmount;
    } else {
      user.gamification.dailyXpEarned = xpAmount;
      user.gamification.dailyXpDate = today;
    }
  } else {
    user.gamification.dailyXpEarned = xpAmount;
    user.gamification.dailyXpDate = today;
  }
  
  await user.save();
  
  return {
    xpAwarded: xpAmount,
    totalXp: newXp,
    level: newLevel,
    leveledUp,
    oldLevel,
    rank: getRank(newLevel).name,
    reason
  };
};
