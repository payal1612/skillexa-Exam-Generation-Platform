import User from '../models/User.js';
import ExamResult from '../models/ExamResult.js';
import Certificate from '../models/Certificate.js';

export const getLeaderboard = async (req, res, next) => {
  try {
    const { period = 'all' } = req.query;
    let dateFilter = {};

    if (period === 'week') {
      dateFilter.createdAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    } else if (period === 'month') {
      dateFilter.createdAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    }

    // Aggregate exam results to get leaderboard stats
    const examStats = await ExamResult.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$user',
          totalExams: { $sum: 1 },
          passedExams: { $sum: { $cond: ['$passed', 1, 0] } },
          totalScore: { $sum: '$score' },
          avgScore: { $avg: '$score' }
        }
      },
      { $sort: { totalExams: -1, avgScore: -1 } },
      { $limit: 100 }
    ]);

    // Get user details and certificates count
    const leaderboard = await Promise.all(
      examStats.map(async (stat, index) => {
        const user = await User.findById(stat._id).select('name avatar stats');
        const certificates = await Certificate.countDocuments({ user: stat._id });
        
        if (!user) return null;
        
        return {
          rank: index + 1,
          _id: user._id,
          name: user.name,
          avatar: user.avatar,
          stats: {
            totalExams: stat.totalExams,
            passedExams: stat.passedExams,
            avgScore: Math.round(stat.avgScore || 0),
            certificates,
            points: stat.totalScore || 0
          }
        };
      })
    );

    // Filter out null entries (deleted users)
    const filteredLeaderboard = leaderboard.filter(entry => entry !== null);

    res.status(200).json({
      success: true,
      leaderboard: filteredLeaderboard
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    next(error);
  }
};

export const getUserRank = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUser = await User.findById(userId);
    
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get user's exam count for ranking
    const userExamCount = await ExamResult.countDocuments({ user: userId });
    
    // Count users with more exams
    const usersAbove = await ExamResult.aggregate([
      { $group: { _id: '$user', count: { $sum: 1 } } },
      { $match: { count: { $gt: userExamCount } } }
    ]);

    const rank = usersAbove.length + 1;
    const user = await User.findById(userId).select('name avatar stats');

    res.status(200).json({
      success: true,
      rank,
      user
    });
  } catch (error) {
    console.error('Error getting user rank:', error);
    next(error);
  }
};

export const getSkillLeaderboard = async (req, res, next) => {
  try {
    const { skillId } = req.params;

    const results = await ExamResult.find({ status: 'completed' })
      .populate('user', 'name avatar')
      .sort({ score: -1 })
      .limit(50);

    const leaderboard = results.map((result, index) => ({
      rank: index + 1,
      user: result.user,
      score: result.score,
      date: result.createdAt
    }));

    res.status(200).json({
      success: true,
      leaderboard
    });
  } catch (error) {
    next(error);
  }
};

export const getTopAchievers = async (req, res, next) => {
  try {
    const topAchievers = await User.find()
      .select('name avatar stats')
      .sort({ 'stats.examsCompleted': -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      achievers: topAchievers
    });
  } catch (error) {
    next(error);
  }
};

export const getPlatformStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    // Count all exam results (not filtering by status since it varies)
    const totalExams = await ExamResult.countDocuments();
    const totalCertificates = await Certificate.countDocuments();

    console.log('Platform stats:', { totalUsers, totalExams, totalCertificates });

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalExams,
        totalCertificates
      }
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    next(error);
  }
};
