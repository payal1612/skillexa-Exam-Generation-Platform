import Achievement from '../models/Achievement.js';
import UserAchievement from '../models/UserAchievement.js';
import ExamResult from '../models/ExamResult.js';
import Certificate from '../models/Certificate.js';

export const getAllAchievements = async (req, res, next) => {
  try {
    const achievements = await Achievement.find({ isActive: true });

    res.status(200).json({
      success: true,
      achievements
    });
  } catch (error) {
    next(error);
  }
};

export const getUserAchievements = async (req, res, next) => {
  try {
    // Get all achievements and user's progress
    const [allAchievements, userAchievements] = await Promise.all([
      Achievement.find({ isActive: true }),
      UserAchievement.find({ user: req.user.id }).populate('achievement')
    ]);

    // Get user stats for progress calculation
    const [examResults, certificates] = await Promise.all([
      ExamResult.find({ user: req.user.id }),
      Certificate.find({ user: req.user.id })
    ]);

    // Calculate progress for each achievement
    const achievementsWithProgress = userAchievements.map(ua => {
      const progress = calculateAchievementProgress(ua.achievement, examResults, certificates);
      return {
        ...ua.toObject(),
        progress: ua.status === 'unlocked' ? 100 : progress,
        unlocked: ua.status === 'unlocked'
      };
    });

    res.status(200).json({
      success: true,
      achievements: achievementsWithProgress
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to calculate achievement progress
const calculateAchievementProgress = (achievement, examResults, certificates) => {
  if (!achievement) return 0;
  
  const title = achievement.title?.toLowerCase() || '';
  
  // First Steps - Complete first exam
  if (title.includes('first steps') || title.includes('first exam')) {
    return examResults.length > 0 ? 100 : 0;
  }
  
  // Quick Learner - Score 90%+ on first exam
  if (title.includes('quick learner')) {
    if (examResults.length > 0) {
      const firstExam = examResults[0];
      return firstExam.score >= 90 ? 100 : Math.round((firstExam.score / 90) * 100);
    }
    return 0;
  }
  
  // Perfect Score - 100% on any exam
  if (title.includes('perfect score')) {
    const perfectScore = examResults.find(r => r.score === 100);
    if (perfectScore) return 100;
    const maxScore = Math.max(...examResults.map(r => r.score), 0);
    return maxScore;
  }
  
  // Certificate based achievements
  if (title.includes('certified') || title.includes('certificate')) {
    return certificates.length > 0 ? 100 : 0;
  }
  
  // Exam count based achievements
  const examCountMatch = achievement.requirement?.match(/complete\s+(\d+)/i);
  if (examCountMatch) {
    const requiredCount = parseInt(examCountMatch[1]);
    return Math.min(100, Math.round((examResults.length / requiredCount) * 100));
  }
  
  return 0;
};

export const getAchievementById = async (req, res, next) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({
        success: false,
        message: 'Achievement not found'
      });
    }

    res.status(200).json({
      success: true,
      achievement
    });
  } catch (error) {
    next(error);
  }
};

export const createAchievement = async (req, res, next) => {
  try {
    const achievement = await Achievement.create(req.body);

    res.status(201).json({
      success: true,
      achievement
    });
  } catch (error) {
    next(error);
  }
};

export const unlockAchievement = async (req, res, next) => {
  try {
    const { achievementId } = req.params;

    let userAchievement = await UserAchievement.findOne({
      user: req.user.id,
      achievement: achievementId
    });

    if (!userAchievement) {
      userAchievement = await UserAchievement.create({
        user: req.user.id,
        achievement: achievementId,
        progress: 100,
        status: 'unlocked',
        unlockedAt: new Date()
      });
    } else if (userAchievement.status !== 'unlocked') {
      userAchievement.status = 'unlocked';
      userAchievement.progress = 100;
      userAchievement.unlockedAt = new Date();
      await userAchievement.save();
    }

    await userAchievement.populate('achievement');

    res.status(200).json({
      success: true,
      userAchievement
    });
  } catch (error) {
    next(error);
  }
};

export const updateProgress = async (req, res, next) => {
  try {
    const { achievementId } = req.params;
    const { progress } = req.body;

    let userAchievement = await UserAchievement.findOne({
      user: req.user.id,
      achievement: achievementId
    });

    if (!userAchievement) {
      userAchievement = await UserAchievement.create({
        user: req.user.id,
        achievement: achievementId,
        progress,
        status: progress >= 100 ? 'unlocked' : 'in_progress'
      });
    } else {
      userAchievement.progress = progress;

      if (progress >= 100 && userAchievement.status !== 'unlocked') {
        userAchievement.status = 'unlocked';
        userAchievement.unlockedAt = new Date();
      }

      await userAchievement.save();
    }

    await userAchievement.populate('achievement');

    res.status(200).json({
      success: true,
      userAchievement
    });
  } catch (error) {
    next(error);
  }
};

// Check and update achievements for a user (call after exam completion)
export const checkAndUpdateAchievements = async (userId) => {
  try {
    const [achievements, examResults, certificates] = await Promise.all([
      Achievement.find({ isActive: true }),
      ExamResult.find({ user: userId }),
      Certificate.find({ user: userId })
    ]);

    for (const achievement of achievements) {
      const progress = calculateAchievementProgress(achievement, examResults, certificates);
      
      let userAchievement = await UserAchievement.findOne({
        user: userId,
        achievement: achievement._id
      });

      if (!userAchievement) {
        userAchievement = new UserAchievement({
          user: userId,
          achievement: achievement._id,
          progress,
          status: progress >= 100 ? 'unlocked' : 'in_progress'
        });
        
        if (progress >= 100) {
          userAchievement.unlockedAt = new Date();
        }
        
        await userAchievement.save();
      } else if (userAchievement.status !== 'unlocked') {
        userAchievement.progress = progress;
        
        if (progress >= 100) {
          userAchievement.status = 'unlocked';
          userAchievement.unlockedAt = new Date();
        }
        
        await userAchievement.save();
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
};
