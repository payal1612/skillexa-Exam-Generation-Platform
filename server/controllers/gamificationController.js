import User from '../models/User.js';
import {
  calculateLevel,
  getXpForNextLevel,
  getLevelProgress,
  getRank,
  updateStreak,
  getStreakBonus,
  awardXp,
  XP_REWARDS,
  XP_PER_LEVEL,
  RANKS
} from '../utils/gamificationUtils.js';

// Get user's gamification stats
export const getGamificationStats = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Initialize gamification if not exists
    if (!user.gamification) {
      user.gamification = {
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        rank: 'Beginner'
      };
      await user.save();
    }

    const level = user.gamification.level || 1;
    const xp = user.gamification.xp || 0;
    const currentLevelXp = XP_PER_LEVEL[level - 1] || 0;
    const nextLevelXp = getXpForNextLevel(level);
    const progress = getLevelProgress(xp, level);
    const rank = getRank(level);

    res.status(200).json({
      success: true,
      gamification: {
        xp,
        level,
        currentStreak: user.gamification.currentStreak || 0,
        longestStreak: user.gamification.longestStreak || 0,
        rank: rank.name,
        rankColor: rank.color,
        currentLevelXp,
        nextLevelXp,
        xpToNextLevel: nextLevelXp - xp,
        progress,
        dailyXpEarned: user.gamification.dailyXpEarned || 0,
        weeklyXp: user.gamification.weeklyXp || 0,
        achievementsUnlocked: user.gamification.achievementsUnlocked || 0,
        challengesCompleted: user.gamification.totalChallengesCompleted || 0,
        lastActivityDate: user.gamification.lastActivityDate
      },
      xpRewards: XP_REWARDS,
      ranks: RANKS
    });
  } catch (error) {
    console.error('Error getting gamification stats:', error);
    next(error);
  }
};

// Award XP to user (can be called from other controllers)
export const awardXpToUser = async (req, res, next) => {
  try {
    const { amount, reason } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const result = await awardXp(user, amount, reason);

    res.status(200).json({
      success: true,
      ...result,
      message: result.leveledUp 
        ? `Congratulations! You leveled up to level ${result.level}!` 
        : `You earned ${amount} XP!`
    });
  } catch (error) {
    console.error('Error awarding XP:', error);
    next(error);
  }
};

// Update user streak on activity
export const updateUserStreak = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Initialize gamification if not exists
    if (!user.gamification) {
      user.gamification = {
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        rank: 'Beginner'
      };
    }

    const streakResult = updateStreak(user);
    let xpAwarded = 0;
    let bonusXp = 0;

    if (streakResult.streakUpdated) {
      user.gamification.currentStreak = streakResult.newStreak;
      user.gamification.lastActivityDate = new Date();
      
      if (streakResult.longestStreak) {
        user.gamification.longestStreak = streakResult.longestStreak;
      }

      // Award daily login XP
      xpAwarded = XP_REWARDS.DAILY_LOGIN;
      
      // Award streak bonus
      bonusXp = getStreakBonus(streakResult.newStreak);
      
      if (xpAwarded + bonusXp > 0) {
        await awardXp(user, xpAwarded + bonusXp, 'daily_streak');
      } else {
        await user.save();
      }
    }

    res.status(200).json({
      success: true,
      streak: {
        current: user.gamification.currentStreak,
        longest: user.gamification.longestStreak,
        streakBroken: streakResult.streakBroken || false,
        xpAwarded: xpAwarded + bonusXp,
        dailyLoginXp: xpAwarded,
        streakBonusXp: bonusXp
      }
    });
  } catch (error) {
    console.error('Error updating streak:', error);
    next(error);
  }
};

// Get XP-based leaderboard
export const getLeaderboardByXp = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;

    const leaderboard = await User.find({
      'gamification.xp': { $gt: 0 }
    })
      .select('name avatar gamification')
      .sort({ 'gamification.xp': -1 })
      .limit(parseInt(limit));

    const formattedLeaderboard = leaderboard.map((user, index) => ({
      rank: index + 1,
      _id: user._id,
      name: user.name,
      avatar: user.avatar,
      xp: user.gamification?.xp || 0,
      level: user.gamification?.level || 1,
      rankTitle: user.gamification?.rank || 'Beginner',
      currentStreak: user.gamification?.currentStreak || 0
    }));

    // Get current user's rank
    const currentUserRank = formattedLeaderboard.findIndex(
      u => u._id.toString() === req.user.id
    ) + 1;

    res.status(200).json({
      success: true,
      leaderboard: formattedLeaderboard,
      userRank: currentUserRank || null
    });
  } catch (error) {
    console.error('Error getting XP leaderboard:', error);
    next(error);
  }
};

// Get daily rewards status
export const getDailyRewards = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastClaim = user.gamification?.dailyXpDate 
      ? new Date(user.gamification.dailyXpDate)
      : null;

    let canClaim = true;
    if (lastClaim) {
      lastClaim.setHours(0, 0, 0, 0);
      canClaim = lastClaim.getTime() !== today.getTime();
    }

    // Daily rewards based on streak
    const streak = user.gamification?.currentStreak || 0;
    const dailyRewards = [
      { day: 1, xp: 10, claimed: streak >= 1 && !canClaim },
      { day: 2, xp: 15, claimed: streak >= 2 && !canClaim },
      { day: 3, xp: 25, bonus: 'Streak Bonus!', claimed: streak >= 3 && !canClaim },
      { day: 4, xp: 30, claimed: streak >= 4 && !canClaim },
      { day: 5, xp: 40, claimed: streak >= 5 && !canClaim },
      { day: 6, xp: 50, claimed: streak >= 6 && !canClaim },
      { day: 7, xp: 100, bonus: 'Weekly Bonus!', claimed: streak >= 7 && !canClaim },
    ];

    res.status(200).json({
      success: true,
      canClaim,
      currentStreak: streak,
      todayReward: canClaim ? XP_REWARDS.DAILY_LOGIN + getStreakBonus(streak + 1) : 0,
      dailyRewards
    });
  } catch (error) {
    console.error('Error getting daily rewards:', error);
    next(error);
  }
};

// Claim daily reward
export const claimDailyReward = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastClaim = user.gamification?.dailyXpDate 
      ? new Date(user.gamification.dailyXpDate)
      : null;

    if (lastClaim) {
      lastClaim.setHours(0, 0, 0, 0);
      if (lastClaim.getTime() === today.getTime()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Daily reward already claimed today!' 
        });
      }
    }

    // Update streak and award XP
    const streakResult = updateStreak(user);
    user.gamification.currentStreak = streakResult.newStreak;
    user.gamification.lastActivityDate = new Date();
    
    if (streakResult.longestStreak) {
      user.gamification.longestStreak = streakResult.longestStreak;
    }

    const baseXp = XP_REWARDS.DAILY_LOGIN;
    const bonusXp = getStreakBonus(streakResult.newStreak);
    const totalXp = baseXp + bonusXp;

    const result = await awardXp(user, totalXp, 'daily_reward');

    res.status(200).json({
      success: true,
      message: 'Daily reward claimed!',
      xpAwarded: totalXp,
      baseXp,
      bonusXp,
      newStreak: streakResult.newStreak,
      leveledUp: result.leveledUp,
      newLevel: result.level
    });
  } catch (error) {
    console.error('Error claiming daily reward:', error);
    next(error);
  }
};

// Helper function to award XP from other controllers
export const awardXpForAction = async (userId, action) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    const xpAmount = XP_REWARDS[action] || 0;
    if (xpAmount === 0) return null;

    return await awardXp(user, xpAmount, action);
  } catch (error) {
    console.error('Error awarding XP for action:', error);
    return null;
  }
};
