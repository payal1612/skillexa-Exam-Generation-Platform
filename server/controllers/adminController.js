import User from '../models/User.js';
import Exam from '../models/Exam.js';
import ExamResult from '../models/ExamResult.js';
import Certificate from '../models/Certificate.js';
import Skill from '../models/Skill.js';
import Achievement from '../models/Achievement.js';
import UserAchievement from '../models/UserAchievement.js';

// ==================== DASHBOARD ====================

// Get comprehensive dashboard stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const adminCount = await User.countDocuments({ role: 'admin' });
    const instructorCount = await User.countDocuments({ role: 'instructor' });
    
    const totalExams = await Exam.countDocuments();
    const activeExams = await Exam.countDocuments({ status: 'active' });
    const draftExams = await Exam.countDocuments({ status: 'draft' });
    const archivedExams = await Exam.countDocuments({ status: 'archived' });
    
    const totalCertificates = await Certificate.countDocuments();
    const activeCertificates = await Certificate.countDocuments({ status: 'active' });
    
    const totalSkills = await Skill.countDocuments();
    const activeSkills = await Skill.countDocuments({ isActive: true });
    
    const totalExamResults = await ExamResult.countDocuments();
    const passedExams = await ExamResult.countDocuments({ status: 'passed' });
    const failedExams = await ExamResult.countDocuments({ status: 'failed' });
    
    const totalAchievements = await Achievement.countDocuments();

    // Calculate pass rate
    const passRate = totalExamResults > 0 
      ? Math.round((passedExams / totalExamResults) * 100) 
      : 0;

    // Get user growth (last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const recentUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const previousUsers = await User.countDocuments({ 
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } 
    });
    const weeklyNewUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    const userGrowth = previousUsers > 0 
      ? Math.round(((recentUsers - previousUsers) / previousUsers) * 100) 
      : 100;

    // Get recent exams this week
    const weeklyExams = await ExamResult.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // Get average score
    const avgScoreResult = await ExamResult.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$score' } } }
    ]);
    const averageScore = avgScoreResult.length > 0 ? Math.round(avgScoreResult[0].avgScore) : 0;

    // User registration trend (last 7 days)
    const registrationTrend = await User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { 
        $group: { 
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Exam activity trend (last 7 days)
    const examTrend = await ExamResult.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { 
        $group: { 
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top performing skills
    const topSkills = await ExamResult.aggregate([
      { $lookup: { from: 'exams', localField: 'exam', foreignField: '_id', as: 'examData' } },
      { $unwind: '$examData' },
      { $group: { _id: '$examData.skillName', attempts: { $sum: 1 }, avgScore: { $avg: '$score' } } },
      { $sort: { attempts: -1 } },
      { $limit: 5 }
    ]);

    // Recent activity
    const recentExamResults = await ExamResult.find()
      .populate('user', 'name email')
      .populate('exam', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          admins: adminCount,
          instructors: instructorCount,
          growth: `${userGrowth >= 0 ? '+' : ''}${userGrowth}%`,
          weeklyNew: weeklyNewUsers
        },
        exams: {
          total: totalExams,
          active: activeExams,
          draft: draftExams,
          archived: archivedExams,
          weeklyAttempts: weeklyExams
        },
        results: {
          total: totalExamResults,
          passed: passedExams,
          failed: failedExams,
          passRate: `${passRate}%`,
          averageScore
        },
        certificates: {
          total: totalCertificates,
          active: activeCertificates
        },
        skills: {
          total: totalSkills,
          active: activeSkills
        },
        achievements: {
          total: totalAchievements
        },
        trends: {
          registrations: registrationTrend,
          examActivity: examTrend,
          topSkills
        },
        recentActivity: recentExamResults
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==================== USER MANAGEMENT ====================

// Get all users with filters
export const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', role = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role && role !== 'all') {
      query.role = role;
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const users = await User.find(query)
      .select('-password')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    // Get detailed stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const examsTaken = await ExamResult.countDocuments({ user: user._id });
        const examsPassed = await ExamResult.countDocuments({ user: user._id, status: 'passed' });
        const certificatesEarned = await Certificate.countDocuments({ user: user._id });
        const achievementsCount = await UserAchievement.countDocuments({ user: user._id });
        
        const avgScoreResult = await ExamResult.aggregate([
          { $match: { user: user._id } },
          { $group: { _id: null, avgScore: { $avg: '$score' } } }
        ]);
        const avgScore = avgScoreResult.length > 0 ? Math.round(avgScoreResult[0].avgScore) : 0;

        return {
          ...user.toObject(),
          examsTaken,
          examsPassed,
          certificatesEarned,
          achievementsCount,
          avgScore,
          passRate: examsTaken > 0 ? Math.round((examsPassed / examsTaken) * 100) : 0
        };
      })
    );

    res.status(200).json({
      success: true,
      users: usersWithStats,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single user by ID with full details
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const examResults = await ExamResult.find({ user: user._id })
      .populate('exam', 'title skillName difficulty')
      .sort({ createdAt: -1 });
    
    const certificates = await Certificate.find({ user: user._id })
      .populate('skill', 'title')
      .sort({ createdAt: -1 });
    
    const achievements = await UserAchievement.find({ user: user._id })
      .populate('achievement')
      .sort({ unlockedAt: -1 });

    const examsTaken = examResults.length;
    const examsPassed = examResults.filter(r => r.status === 'passed').length;
    const avgScore = examsTaken > 0 
      ? Math.round(examResults.reduce((sum, r) => sum + r.score, 0) / examsTaken)
      : 0;

    res.status(200).json({
      success: true,
      user: {
        ...user.toObject(),
        examsTaken,
        examsPassed,
        avgScore,
        passRate: examsTaken > 0 ? Math.round((examsPassed / examsTaken) * 100) : 0,
        certificatesEarned: certificates.length,
        achievementsCount: achievements.length
      },
      examResults,
      certificates,
      achievements
    });
  } catch (error) {
    next(error);
  }
};

// Create new user (admin only)
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role = 'user', bio = '' } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      bio
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

// Update user
export const updateUser = async (req, res, next) => {
  try {
    const { name, email, role, bio, avatar } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// Reset user password
export const resetUserPassword = async (req, res, next) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};

// Delete user
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent deleting yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    // Delete all related data
    await ExamResult.deleteMany({ user: req.params.id });
    await Certificate.deleteMany({ user: req.params.id });
    await UserAchievement.deleteMany({ user: req.params.id });
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'User and all related data deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Bulk delete users
export const bulkDeleteUsers = async (req, res, next) => {
  try {
    const { userIds } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide user IDs' });
    }

    // Filter out admin's own ID
    const filteredIds = userIds.filter(id => id !== req.user._id.toString());

    await ExamResult.deleteMany({ user: { $in: filteredIds } });
    await Certificate.deleteMany({ user: { $in: filteredIds } });
    await UserAchievement.deleteMany({ user: { $in: filteredIds } });
    await User.deleteMany({ _id: { $in: filteredIds } });

    res.status(200).json({ 
      success: true, 
      message: `${filteredIds.length} users deleted successfully` 
    });
  } catch (error) {
    next(error);
  }
};

// Export users
export const exportUsers = async (req, res, next) => {
  try {
    const { format = 'json' } = req.query;

    const users = await User.find().select('-password').sort({ createdAt: -1 });

    const exportData = await Promise.all(users.map(async (user) => {
      const examsTaken = await ExamResult.countDocuments({ user: user._id });
      const certificates = await Certificate.countDocuments({ user: user._id });
      return {
        name: user.name,
        email: user.email,
        role: user.role,
        examsTaken,
        certificates,
        createdAt: user.createdAt
      };
    }));

    if (format === 'csv') {
      const csv = [
        'Name,Email,Role,Exams Taken,Certificates,Created At',
        ...exportData.map(u => `"${u.name}","${u.email}","${u.role}",${u.examsTaken},${u.certificates},"${u.createdAt}"`)
      ].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=users.csv');
      return res.send(csv);
    }

    res.status(200).json({ success: true, users: exportData });
  } catch (error) {
    next(error);
  }
};

// ==================== EXAM MANAGEMENT ====================

// Get all exams with filters
export const getAllExams = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status = '', difficulty = '', search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = {};
    if (status && status !== 'all') query.status = status;
    if (difficulty && difficulty !== 'all') query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { skillName: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const exams = await Exam.find(query)
      .populate('creator', 'name email')
      .populate('skill', 'title')
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Exam.countDocuments(query);

    // Get detailed stats for each exam
    const examsWithStats = await Promise.all(
      exams.map(async (exam) => {
        const results = await ExamResult.find({ exam: exam._id });
        const attempts = results.length;
        const passed = results.filter(r => r.status === 'passed').length;
        const avgScore = attempts > 0
          ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / attempts)
          : 0;
        
        return {
          ...exam.toObject(),
          attempts,
          passed,
          failed: attempts - passed,
          avgScore,
          passRate: attempts > 0 ? Math.round((passed / attempts) * 100) : 0
        };
      })
    );

    res.status(200).json({
      success: true,
      exams: examsWithStats,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get single exam with details
export const getExamById = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('creator', 'name email')
      .populate('skill', 'title');

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    const results = await ExamResult.find({ exam: exam._id })
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    const attempts = results.length;
    const passed = results.filter(r => r.status === 'passed').length;
    const avgScore = attempts > 0
      ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / attempts)
      : 0;

    res.status(200).json({
      success: true,
      exam: {
        ...exam.toObject(),
        attempts,
        passed,
        failed: attempts - passed,
        avgScore,
        passRate: attempts > 0 ? Math.round((passed / attempts) * 100) : 0
      },
      results
    });
  } catch (error) {
    next(error);
  }
};

// Create exam
export const createExam = async (req, res, next) => {
  try {
    const { title, skillName, category, difficulty, questions, timeLimit, passingScore, status } = req.body;

    const exam = await Exam.create({
      title,
      skillName,
      category,
      difficulty,
      questions,
      timeLimit: timeLimit || 30,
      passingScore: passingScore || 70,
      status: status || 'draft',
      creator: req.user._id
    });

    res.status(201).json({ success: true, exam });
  } catch (error) {
    next(error);
  }
};

// Update exam
export const updateExam = async (req, res, next) => {
  try {
    const { title, skillName, category, difficulty, questions, timeLimit, passingScore, status } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (skillName) updateData.skillName = skillName;
    if (category) updateData.category = category;
    if (difficulty) updateData.difficulty = difficulty;
    if (questions) updateData.questions = questions;
    if (timeLimit) updateData.timeLimit = timeLimit;
    if (passingScore) updateData.passingScore = passingScore;
    if (status) updateData.status = status;

    const exam = await Exam.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('creator', 'name email');

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    res.status(200).json({ success: true, exam });
  } catch (error) {
    next(error);
  }
};

// Delete exam
export const deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    await Exam.findByIdAndDelete(req.params.id);
    await ExamResult.deleteMany({ exam: req.params.id });

    res.status(200).json({ success: true, message: 'Exam and all results deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// Bulk update exam status
export const bulkUpdateExamStatus = async (req, res, next) => {
  try {
    const { examIds, status } = req.body;

    if (!examIds || !Array.isArray(examIds) || !status) {
      return res.status(400).json({ success: false, message: 'Please provide exam IDs and status' });
    }

    await Exam.updateMany(
      { _id: { $in: examIds } },
      { status }
    );

    res.status(200).json({ 
      success: true, 
      message: `${examIds.length} exams updated to ${status}` 
    });
  } catch (error) {
    next(error);
  }
};

// ==================== EXAM RESULTS ====================

// Get all exam results
export const getAllExamResults = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status = '', userId = '', examId = '' } = req.query;

    const query = {};
    if (status && status !== 'all') query.status = status;
    if (userId) query.user = userId;
    if (examId) query.exam = examId;

    const results = await ExamResult.find(query)
      .populate('user', 'name email')
      .populate('exam', 'title skillName difficulty')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ExamResult.countDocuments(query);

    res.status(200).json({
      success: true,
      results,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete exam result
export const deleteExamResult = async (req, res, next) => {
  try {
    const result = await ExamResult.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }

    res.status(200).json({ success: true, message: 'Exam result deleted' });
  } catch (error) {
    next(error);
  }
};

// ==================== SKILLS MANAGEMENT ====================

// Get all skills
export const getAllSkills = async (req, res, next) => {
  try {
    const { category = '', search = '' } = req.query;

    const query = {};
    if (category && category !== 'all') query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skills = await Skill.find(query).sort({ createdAt: -1 });

    // Get detailed stats for each skill
    const skillsWithStats = await Promise.all(
      skills.map(async (skill) => {
        const examCount = await Exam.countDocuments({ skill: skill._id });
        const activeExams = await Exam.countDocuments({ skill: skill._id, status: 'active' });
        const certificateCount = await Certificate.countDocuments({ skill: skill._id });
        
        return {
          ...skill.toObject(),
          examCount,
          activeExams,
          certificateCount
        };
      })
    );

    res.status(200).json({ success: true, skills: skillsWithStats });
  } catch (error) {
    next(error);
  }
};

// Create skill
export const createSkill = async (req, res, next) => {
  try {
    const { title, description, category, difficulty, topics, duration, popularity, isActive } = req.body;

    const skill = await Skill.create({
      title,
      description,
      category,
      difficulty,
      topics: topics || [],
      duration,
      popularity: popularity || 0,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({ success: true, skill });
  } catch (error) {
    next(error);
  }
};

// Update skill
export const updateSkill = async (req, res, next) => {
  try {
    const { title, description, category, difficulty, topics, duration, popularity, isActive } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (difficulty) updateData.difficulty = difficulty;
    if (topics) updateData.topics = topics;
    if (duration) updateData.duration = duration;
    if (popularity !== undefined) updateData.popularity = popularity;
    if (isActive !== undefined) updateData.isActive = isActive;

    const skill = await Skill.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    res.status(200).json({ success: true, skill });
  } catch (error) {
    next(error);
  }
};

// Delete skill
export const deleteSkill = async (req, res, next) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({ success: false, message: 'Skill not found' });
    }

    await Skill.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Skill deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ==================== CERTIFICATES ====================

// Get all certificates
export const getAllCertificates = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status = '', search = '' } = req.query;

    const query = {};
    if (status && status !== 'all') query.status = status;

    let certificates = await Certificate.find(query)
      .populate('user', 'name email')
      .populate('skill', 'title')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Filter by search if provided
    if (search) {
      certificates = certificates.filter(cert => 
        cert.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        cert.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        cert.skill?.title?.toLowerCase().includes(search.toLowerCase()) ||
        cert.skillName?.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = await Certificate.countDocuments(query);

    res.status(200).json({
      success: true,
      certificates,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get certificate by ID
export const getCertificateById = async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('user', 'name email')
      .populate('skill', 'title description');

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    res.status(200).json({ success: true, certificate });
  } catch (error) {
    next(error);
  }
};

// Revoke certificate
export const revokeCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findByIdAndUpdate(
      req.params.id,
      { status: 'revoked' },
      { new: true }
    );

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    res.status(200).json({ success: true, message: 'Certificate revoked', certificate });
  } catch (error) {
    next(error);
  }
};

// Delete certificate
export const deleteCertificate = async (req, res, next) => {
  try {
    const certificate = await Certificate.findByIdAndDelete(req.params.id);

    if (!certificate) {
      return res.status(404).json({ success: false, message: 'Certificate not found' });
    }

    res.status(200).json({ success: true, message: 'Certificate deleted' });
  } catch (error) {
    next(error);
  }
};

// ==================== ACHIEVEMENTS ====================

// Get all achievements
export const getAllAchievements = async (req, res, next) => {
  try {
    const achievements = await Achievement.find().sort({ createdAt: -1 });

    // Get unlock counts for each achievement
    const achievementsWithStats = await Promise.all(
      achievements.map(async (achievement) => {
        const unlockCount = await UserAchievement.countDocuments({ achievement: achievement._id });
        return {
          ...achievement.toObject(),
          unlockCount
        };
      })
    );

    res.status(200).json({ success: true, achievements: achievementsWithStats });
  } catch (error) {
    next(error);
  }
};

// Create achievement
export const createAchievement = async (req, res, next) => {
  try {
    const { title, description, category, points, rarity, requirement, icon, isActive } = req.body;

    const achievement = await Achievement.create({
      title,
      description,
      category,
      points: points || 0,
      rarity: rarity || 'common',
      requirement,
      icon,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({ success: true, achievement });
  } catch (error) {
    next(error);
  }
};

// Update achievement
export const updateAchievement = async (req, res, next) => {
  try {
    const { title, description, category, points, rarity, requirement, icon, isActive } = req.body;

    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (category) updateData.category = category;
    if (points !== undefined) updateData.points = points;
    if (rarity) updateData.rarity = rarity;
    if (requirement) updateData.requirement = requirement;
    if (icon) updateData.icon = icon;
    if (isActive !== undefined) updateData.isActive = isActive;

    const achievement = await Achievement.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }

    res.status(200).json({ success: true, achievement });
  } catch (error) {
    next(error);
  }
};

// Delete achievement
export const deleteAchievement = async (req, res, next) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }

    await UserAchievement.deleteMany({ achievement: req.params.id });
    await Achievement.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Achievement deleted' });
  } catch (error) {
    next(error);
  }
};

// ==================== ANALYTICS ====================

// Get detailed analytics
export const getAnalytics = async (req, res, next) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);

    // User registrations over time
    const userRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: daysAgo } } },
      { 
        $group: { 
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Exam attempts over time
    const examAttempts = await ExamResult.aggregate([
      { $match: { createdAt: { $gte: daysAgo } } },
      { 
        $group: { 
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          attempts: { $sum: 1 },
          passed: { $sum: { $cond: [{ $eq: ['$status', 'passed'] }, 1, 0] } },
          avgScore: { $avg: '$score' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Skills by popularity
    const skillPopularity = await ExamResult.aggregate([
      { $lookup: { from: 'exams', localField: 'exam', foreignField: '_id', as: 'examData' } },
      { $unwind: '$examData' },
      { 
        $group: { 
          _id: '$examData.skillName',
          attempts: { $sum: 1 },
          avgScore: { $avg: '$score' },
          passed: { $sum: { $cond: [{ $eq: ['$status', 'passed'] }, 1, 0] } }
        }
      },
      { $sort: { attempts: -1 } },
      { $limit: 10 }
    ]);

    // User roles distribution
    const roleDistribution = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Difficulty distribution
    const difficultyStats = await Exam.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);

    // Certificate issuance over time
    const certificateIssuance = await Certificate.aggregate([
      { $match: { createdAt: { $gte: daysAgo } } },
      { 
        $group: { 
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top performers
    const topPerformers = await ExamResult.aggregate([
      { 
        $group: { 
          _id: '$user',
          totalExams: { $sum: 1 },
          avgScore: { $avg: '$score' },
          passed: { $sum: { $cond: [{ $eq: ['$status', 'passed'] }, 1, 0] } }
        }
      },
      { $match: { totalExams: { $gte: 3 } } },
      { $sort: { avgScore: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userData' } },
      { $unwind: '$userData' },
      { 
        $project: { 
          name: '$userData.name',
          email: '$userData.email',
          totalExams: 1,
          avgScore: { $round: ['$avgScore', 0] },
          passRate: { $round: [{ $multiply: [{ $divide: ['$passed', '$totalExams'] }, 100] }, 0] }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        userRegistrations,
        examAttempts,
        skillPopularity,
        roleDistribution,
        difficultyStats,
        certificateIssuance,
        topPerformers
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==================== SYSTEM SETTINGS ====================

// Get system info
export const getSystemInfo = async (req, res, next) => {
  try {
    const dbStats = {
      users: await User.countDocuments(),
      exams: await Exam.countDocuments(),
      results: await ExamResult.countDocuments(),
      certificates: await Certificate.countDocuments(),
      skills: await Skill.countDocuments(),
      achievements: await Achievement.countDocuments()
    };

    res.status(200).json({
      success: true,
      system: {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        dbStats
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==================== ACTIVITY LOGS ====================

// Get recent activity
export const getRecentActivity = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;

    // Get recent exam results
    const recentExams = await ExamResult.find()
      .populate('user', 'name email')
      .populate('exam', 'title')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Get recent certificates
    const recentCertificates = await Certificate.find()
      .populate('user', 'name email')
      .populate('skill', 'title')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Get recent user registrations
    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Combine and sort by date
    const activities = [
      ...recentExams.map(r => ({
        type: 'exam',
        action: r.status === 'passed' ? 'passed' : 'failed',
        user: r.user?.name || 'Unknown',
        email: r.user?.email,
        target: r.exam?.title || 'Unknown Exam',
        score: r.score,
        date: r.createdAt
      })),
      ...recentCertificates.map(c => ({
        type: 'certificate',
        action: 'earned',
        user: c.user?.name || 'Unknown',
        email: c.user?.email,
        target: c.skill?.title || c.skillName || 'Unknown Skill',
        date: c.createdAt
      })),
      ...recentUsers.map(u => ({
        type: 'user',
        action: 'registered',
        user: u.name,
        email: u.email,
        role: u.role,
        date: u.createdAt
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(limit));

    res.status(200).json({ success: true, activities });
  } catch (error) {
    next(error);
  }
};
