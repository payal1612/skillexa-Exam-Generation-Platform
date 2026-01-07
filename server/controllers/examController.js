import Exam from '../models/Exam.js';
import ExamResult from '../models/ExamResult.js';
import Certificate from '../models/Certificate.js';
import User from '../models/User.js';
import { awardXp, XP_REWARDS, calculateLevel, getRank } from '../utils/gamificationUtils.js';

export const getAllExams = async (req, res, next) => {
  try {
    const { skill, difficulty } = req.query;
    let query = { status: 'active' };

    if (skill) {
      query.skill = skill;
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    const exams = await Exam.find(query)
      .populate('skill', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: exams.length,
      exams
    });
  } catch (error) {
    next(error);
  }
};

export const getExamById = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('skill', 'title')
      .populate('creator', 'name email');

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    res.status(200).json({
      success: true,
      exam
    });
  } catch (error) {
    next(error);
  }
};

export const createExam = async (req, res, next) => {
  try {
    const exam = await Exam.create({
      ...req.body,
      creator: req.user.id
    });

    await exam.populate('skill', 'title');

    res.status(201).json({
      success: true,
      exam
    });
  } catch (error) {
    next(error);
  }
};

export const submitExam = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const { answers, timeSpent } = req.body;

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found'
      });
    }

    let correctCount = 0;
    const processedAnswers = answers.map((answer, index) => {
      const question = exam.questions[index];
      const isCorrect = answer.selectedAnswer === question.correctAnswer;

      if (isCorrect) correctCount++;

      return {
        questionId: question._id,
        selectedAnswer: answer.selectedAnswer,
        isCorrect
      };
    });

    const score = Math.round((correctCount / exam.questions.length) * 100);
    const passed = score >= exam.passingScore;

    const result = await ExamResult.create({
      user: req.user.id,
      exam: examId,
      answers: processedAnswers,
      score,
      totalQuestions: exam.questions.length,
      correctAnswers: correctCount,
      timeSpent,
      passed,
      status: 'completed'
    });

    exam.attempts += 1;
    exam.averageScore = ((exam.averageScore * (exam.attempts - 1)) + score) / exam.attempts;
    await exam.save();

    // Update user stats for completed exam
    const statsUpdate = { 
      'stats.examsCompleted': 1,
      'stats.totalScore': score
    };
    
    // Also increment passed exams if user passed
    if (passed) {
      statsUpdate['stats.examsPassed'] = 1;
    }
    
    await User.findByIdAndUpdate(req.user.id, { $inc: statsUpdate });

    // Award XP for exam completion (Gamification)
    const user = await User.findById(req.user.id);
    let xpAwarded = 0;
    let leveledUp = false;
    let newLevel = user.gamification?.level || 1;
    
    // Check if this is user's first exam
    const examCount = await ExamResult.countDocuments({ user: req.user.id });
    if (examCount === 1) {
      xpAwarded += XP_REWARDS.FIRST_EXAM;
    }
    
    // XP for completing exam
    xpAwarded += XP_REWARDS.EXAM_COMPLETED;
    
    // Additional XP for passing
    if (passed) {
      xpAwarded += XP_REWARDS.EXAM_PASSED;
    }
    
    // Bonus for perfect score
    if (score === 100) {
      xpAwarded += XP_REWARDS.PERFECT_SCORE;
    }
    
    // Award the XP
    if (xpAwarded > 0 && user) {
      const xpResult = await awardXp(user, xpAwarded, 'exam_completion');
      leveledUp = xpResult.leveledUp;
      newLevel = xpResult.level;
    }

    // Create certificate if user passed
    let certificate = null;
    if (passed) {
      // Check if certificate already exists for this skill
      const existingCert = await Certificate.findOne({
        user: req.user.id,
        skill: exam.skill
      });

      if (!existingCert) {
        certificate = await Certificate.create({
          user: req.user.id,
          skill: exam.skill,
          skillName: exam.skillName || exam.title,
          score,
          issuedDate: new Date(),
          status: 'active'
        });

        // Update user stats
        await User.findByIdAndUpdate(req.user.id, {
          $inc: { 'stats.certificatesEarned': 1 }
        });
      }
    }

    res.status(200).json({
      success: true,
      result: {
        score,
        passed,
        correctAnswers: correctCount,
        totalQuestions: exam.questions.length,
        certificate: certificate ? certificate._id : null,
        // Gamification data
        xpAwarded,
        leveledUp,
        newLevel,
        rank: getRank(newLevel).name
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getExamResults = async (req, res, next) => {
  try {
    const { examId } = req.params;

    const results = await ExamResult.find({
      user: req.user.id,
      exam: examId
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      results
    });
  } catch (error) {
    next(error);
  }
};

export const getUserExamResults = async (req, res, next) => {
  try {
    const results = await ExamResult.find({ user: req.user.id })
      .populate('exam', 'title skillName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      results
    });
  } catch (error) {
    next(error);
  }
};

// Submit results from AI-generated exam (no database exam ID)
export const submitGeneratedExamResults = async (req, res, next) => {
  try {
    const { skillName, skillId, score, totalQuestions, correctAnswers, timeSpent, passed } = req.body;
    
    console.log('Received exam submission - skillName:', skillName, 'score:', score, 'passed:', passed);

    // Find or create a skill reference
    let skill = null;
    if (skillId) {
      const Skill = (await import('../models/Skill.js')).default;
      skill = await Skill.findById(skillId);
    }

    // Create exam result record
    const result = await ExamResult.create({
      user: req.user.id,
      skillName: skillName || 'AI Generated Exam',
      score,
      totalQuestions,
      correctAnswers,
      timeSpent,
      passed: passed || score >= 70,
      status: 'completed',
      completedAt: new Date()
    });

    const isPassed = passed || score >= 70;

    // Update user stats
    const statsUpdate = { 
      'stats.examsCompleted': 1,
      'stats.totalScore': score
    };
    
    // Also increment passed exams if user passed
    if (isPassed) {
      statsUpdate['stats.examsPassed'] = 1;
    }
    
    await User.findByIdAndUpdate(req.user.id, { $inc: statsUpdate });

    // Award XP for exam completion (Gamification)
    const user = await User.findById(req.user.id);
    let xpAwarded = 0;
    let leveledUp = false;
    let newLevel = user.gamification?.level || 1;
    
    // Check if this is user's first exam
    const examCount = await ExamResult.countDocuments({ user: req.user.id });
    if (examCount === 1) {
      xpAwarded += XP_REWARDS.FIRST_EXAM;
    }
    
    // XP for completing exam
    xpAwarded += XP_REWARDS.EXAM_COMPLETED;
    
    // Additional XP for passing
    if (isPassed) {
      xpAwarded += XP_REWARDS.EXAM_PASSED;
    }
    
    // Bonus for perfect score
    if (score === 100) {
      xpAwarded += XP_REWARDS.PERFECT_SCORE;
    }
    
    // Award the XP
    if (xpAwarded > 0 && user) {
      const xpResult = await awardXp(user, xpAwarded, 'exam_completion');
      leveledUp = xpResult.leveledUp;
      newLevel = xpResult.level;
    }

    // Create certificate if user passed
    let certificate = null;
    if (isPassed) {
      try {
        // Check if certificate already exists for this skill/skillName
        let existingCert = null;
        if (skill) {
          existingCert = await Certificate.findOne({
            user: req.user.id,
            skill: skill._id
          });
        } else {
          // For AI-generated exams, check by skillName
          existingCert = await Certificate.findOne({
            user: req.user.id,
            skillName: skillName || 'AI Generated Exam'
          });
        }

        if (!existingCert) {
          const certData = {
            user: req.user.id,
            skillName: skillName || 'AI Generated Exam',
            score,
            issuedDate: new Date(),
            status: 'active'
          };

          if (skill) {
            certData.skill = skill._id;
          }

          certificate = await Certificate.create(certData);
          console.log('Certificate created:', certificate._id);

          // Update user stats for certificate
          await User.findByIdAndUpdate(req.user.id, {
            $inc: { 'stats.certificatesEarned': 1 }
          });
        } else {
          console.log('Certificate already exists:', existingCert._id);
          certificate = existingCert;
        }
      } catch (certError) {
        console.error('Error creating certificate:', certError);
        // Don't fail the entire request if certificate creation fails
      }
    }

    res.status(200).json({
      success: true,
      result: {
        id: result._id,
        score,
        passed: passed || score >= 70,
        correctAnswers,
        totalQuestions,
        // Gamification data
        xpAwarded,
        leveledUp,
        newLevel,
        rank: getRank(newLevel).name
      },
      certificate: certificate ? certificate._id : null
    });
  } catch (error) {
    console.error('Error submitting exam results:', error);
    next(error);
  }
};

export const generateExam = async (req, res, next) => {
  try {
    const { skill, difficulty, questionCount } = req.body;

    // Validate input
    if (!skill || !difficulty || !questionCount) {
      return res.status(400).json({
        success: false,
        message: 'Skill, difficulty, and question count are required.'
      });
    }

    // Generate exam logic (placeholder)
    const questions = await generateQuestions(skill, difficulty, questionCount);

    const newExam = await Exam.create({
      skill,
      difficulty,
      questions,
      creator: req.user.id
    });

    res.status(201).json({
      success: true,
      exam: newExam
    });
  } catch (error) {
    next(error);
  }
};

// Placeholder function for generating questions
const generateQuestions = async (skill, difficulty, questionCount) => {
  // Logic to fetch/generate questions based on skill and difficulty
  return Array.from({ length: questionCount }, (_, i) => ({
    question: `Sample question ${i + 1}`,
    options: ['A', 'B', 'C', 'D'],
    answer: 'A'
  }));
};
