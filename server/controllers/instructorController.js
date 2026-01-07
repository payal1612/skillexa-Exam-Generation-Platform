import Exam from '../models/Exam.js';
import ExamResult from '../models/ExamResult.js';
import Certificate from '../models/Certificate.js';
import User from '../models/User.js';

// Get instructor dashboard stats - shows all platform data
export const getInstructorStats = async (req, res, next) => {
  try {
    // Get total exams on platform
    const totalExams = await Exam.countDocuments();
    
    // Get total students (users with role 'user')
    const activeStudents = await User.countDocuments({ role: 'user' });

    // Calculate average score across all exam results
    const scoreStats = await ExamResult.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$score' } } }
    ]);
    const avgScore = scoreStats.length > 0 ? Math.round(scoreStats[0].avgScore) : 0;

    // Count total certificates issued
    const certificatesIssued = await Certificate.countDocuments();

    // Get changes (compared to last week)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const newExamsThisWeek = await Exam.countDocuments({ createdAt: { $gte: oneWeekAgo } });
    const newStudentsThisWeek = await User.countDocuments({ role: 'user', createdAt: { $gte: oneWeekAgo } });
    const newCertsThisWeek = await Certificate.countDocuments({ createdAt: { $gte: oneWeekAgo } });

    res.status(200).json({
      success: true,
      stats: {
        totalExams,
        activeStudents,
        avgScore: avgScore + '%',
        certificatesIssued,
        newExamsThisWeek,
        newStudentsThisWeek,
        newCertsThisWeek
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all exams on the platform
export const getInstructorExams = async (req, res, next) => {
  try {
    const { status, search } = req.query;

    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { skillName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    const exams = await Exam.find(query)
      .populate('skill', 'title')
      .populate('creator', 'name')
      .sort({ createdAt: -1 });

    // For each exam, get additional stats
    const examsWithStats = await Promise.all(exams.map(async (exam) => {
      const studentCount = await ExamResult.distinct('user', { exam: exam._id });
      const scoreStats = await ExamResult.aggregate([
        { $match: { exam: exam._id } },
        { $group: { _id: null, avgScore: { $avg: '$score' } } }
      ]);

      return {
        id: exam._id,
        title: exam.title,
        category: exam.category || exam.skill?.title || 'General',
        difficulty: exam.difficulty,
        questions: exam.questions?.length || 0,
        timeLimit: exam.timeLimit,
        students: studentCount.length,
        avgScore: scoreStats.length > 0 ? Math.round(scoreStats[0].avgScore) : 0,
        status: exam.status === 'active' ? 'Active' : exam.status === 'draft' ? 'Draft' : 'Archived',
        created: exam.createdAt.toISOString().split('T')[0],
        createdBy: exam.creator?.name || 'Unknown',
        lastUpdated: exam.updatedAt ? exam.updatedAt.toISOString().split('T')[0] : exam.createdAt.toISOString().split('T')[0]
      };
    }));

    res.status(200).json({
      success: true,
      count: examsWithStats.length,
      exams: examsWithStats
    });
  } catch (error) {
    next(error);
  }
};

// Get all students on the platform with their exam stats
export const getInstructorStudents = async (req, res, next) => {
  try {
    // Get all users with role 'user' (students)
    const allStudents = await User.find({ role: 'user' }).select('name email stats createdAt');

    // Get exam results for each student
    const studentsWithDetails = await Promise.all(allStudents.map(async (student) => {
      const examResults = await ExamResult.find({ user: student._id });
      
      const examsCompleted = examResults.length;
      const avgScore = examsCompleted > 0 
        ? Math.round(examResults.reduce((sum, r) => sum + r.score, 0) / examsCompleted)
        : 0;
      
      // Get last active date from most recent exam or account creation
      const lastExam = await ExamResult.findOne({ user: student._id }).sort({ createdAt: -1 });
      const lastActive = lastExam ? lastExam.createdAt : student.createdAt;

      return {
        id: student._id,
        name: student.name,
        email: student.email,
        examsCompleted,
        avgScore,
        certificatesEarned: student.stats?.certificatesEarned || 0,
        lastActive: lastActive.toISOString().split('T')[0],
        joinedDate: student.createdAt.toISOString().split('T')[0]
      };
    }));

    // Sort by last active
    studentsWithDetails.sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));

    res.status(200).json({
      success: true,
      count: studentsWithDetails.length,
      students: studentsWithDetails
    });
  } catch (error) {
    next(error);
  }
};

// Get recent activity across all users
export const getInstructorActivity = async (req, res, next) => {
  try {
    // Get recent exam results across all users
    const recentResults = await ExamResult.find()
      .populate('user', 'name email')
      .populate('exam', 'title')
      .sort({ createdAt: -1 })
      .limit(20);

    const activities = recentResults.map(result => {
      const timeDiff = Date.now() - result.createdAt.getTime();
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      
      let timeAgo;
      if (days > 0) {
        timeAgo = `${days} day${days > 1 ? 's' : ''} ago`;
      } else if (hours > 0) {
        timeAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else {
        const minutes = Math.floor(timeDiff / (1000 * 60));
        timeAgo = `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      }

      return {
        type: 'exam_completed',
        student: result.user?.name || 'Unknown Student',
        studentEmail: result.user?.email || '',
        exam: result.exam?.title || result.skillName || 'Unknown Exam',
        score: result.score,
        passed: result.passed,
        time: timeAgo,
        date: result.createdAt
      };
    });

    // Also get recent user registrations
    const recentUsers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(5);

    const userActivities = recentUsers.map(user => {
      const timeDiff = Date.now() - user.createdAt.getTime();
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      
      let timeAgo;
      if (days > 0) {
        timeAgo = `${days} day${days > 1 ? 's' : ''} ago`;
      } else if (hours > 0) {
        timeAgo = `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else {
        const minutes = Math.floor(timeDiff / (1000 * 60));
        timeAgo = `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      }

      return {
        type: 'new_registration',
        student: user.name,
        studentEmail: user.email,
        time: timeAgo,
        date: user.createdAt
      };
    });

    // Combine and sort by date
    const allActivities = [...activities, ...userActivities]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 15);

    res.status(200).json({
      success: true,
      activities: allActivities
    });
  } catch (error) {
    next(error);
  }
};

// Update exam status
export const updateExamStatus = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const { status } = req.body;

    // Instructors can update any exam
    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    exam.status = status;
    await exam.save();

    res.status(200).json({
      success: true,
      message: 'Exam status updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Delete exam
export const deleteExam = async (req, res, next) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    await Exam.deleteOne({ _id: examId });

    res.status(200).json({
      success: true,
      message: 'Exam deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get platform-wide analytics
export const getInstructorAnalytics = async (req, res, next) => {
  try {
    // Get all exams
    const allExams = await Exam.find();

    // Get score distribution across all results
    const scoreDistribution = await ExamResult.aggregate([
      {
        $bucket: {
          groupBy: '$score',
          boundaries: [0, 50, 60, 70, 80, 90, 101],
          default: 'Other',
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    // Get exams performance for all exams
    const examPerformance = await Promise.all(allExams.map(async (exam) => {
      const stats = await ExamResult.aggregate([
        { $match: { exam: exam._id } },
        {
          $group: {
            _id: null,
            attempts: { $sum: 1 },
            avgScore: { $avg: '$score' },
            passRate: { $avg: { $cond: ['$passed', 1, 0] } }
          }
        }
      ]);

      return {
        examId: exam._id,
        title: exam.title,
        attempts: stats.length > 0 ? stats[0].attempts : 0,
        avgScore: stats.length > 0 ? Math.round(stats[0].avgScore) : 0,
        passRate: stats.length > 0 ? Math.round(stats[0].passRate * 100) : 0
      };
    }));

    // Filter out exams with no attempts and sort by attempts
    const activeExamPerformance = examPerformance
      .filter(e => e.attempts > 0)
      .sort((a, b) => b.attempts - a.attempts);

    // Get daily activity for last 7 days (all exams)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyActivity = await ExamResult.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          attempts: { $sum: 1 },
          avgScore: { $avg: '$score' },
          passCount: { $sum: { $cond: ['$passed', 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get top performing students
    const topStudents = await ExamResult.aggregate([
      {
        $group: {
          _id: '$user',
          totalExams: { $sum: 1 },
          avgScore: { $avg: '$score' },
          totalScore: { $sum: '$score' }
        }
      },
      { $match: { totalExams: { $gte: 1 } } },
      { $sort: { avgScore: -1, totalExams: -1 } },
      { $limit: 10 }
    ]);

    // Populate top student names
    const topStudentsWithNames = await Promise.all(topStudents.map(async (student) => {
      const user = await User.findById(student._id).select('name email');
      return {
        name: user?.name || 'Unknown',
        email: user?.email || '',
        totalExams: student.totalExams,
        avgScore: Math.round(student.avgScore)
      };
    }));

    // Get pass/fail stats
    const passFailStats = await ExamResult.aggregate([
      {
        $group: {
          _id: null,
          totalAttempts: { $sum: 1 },
          passed: { $sum: { $cond: ['$passed', 1, 0] } },
          failed: { $sum: { $cond: ['$passed', 0, 1] } }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        scoreDistribution,
        examPerformance: activeExamPerformance,
        dailyActivity,
        topStudents: topStudentsWithNames,
        passFailStats: passFailStats[0] || { totalAttempts: 0, passed: 0, failed: 0 }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Export all student data
export const exportStudentData = async (req, res, next) => {
  try {
    // Get all exams
    const allExams = await Exam.find().select('_id title');
    const examTitleMap = {};
    allExams.forEach(e => { examTitleMap[e._id.toString()] = e.title; });

    // Get all results
    const results = await ExamResult.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    const exportData = results.map(result => ({
      studentName: result.user?.name || 'Unknown',
      studentEmail: result.user?.email || 'Unknown',
      examTitle: result.exam ? (examTitleMap[result.exam.toString()] || result.skillName) : result.skillName || 'AI Generated Exam',
      score: result.score,
      passed: result.passed ? 'Yes' : 'No',
      completedAt: result.createdAt.toISOString()
    }));

    res.status(200).json({
      success: true,
      data: exportData
    });
  } catch (error) {
    next(error);
  }
};
