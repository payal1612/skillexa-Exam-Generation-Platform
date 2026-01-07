import Challenge from '../models/Challenge.js';
import User from '../models/User.js';
import { awardXp, XP_REWARDS, getRank } from '../utils/gamificationUtils.js';

// Get all challenges with filters
export const getChallenges = async (req, res) => {
  try {
    const { 
      eventType, 
      difficulty, 
      skill, 
      status, 
      participantLevel,
      search,
      page = 1,
      limit = 12 
    } = req.query;

    const query = { isActive: true };

    if (eventType && eventType !== 'all') {
      query.eventType = eventType;
    }
    if (difficulty && difficulty !== 'all') {
      query.difficulty = difficulty;
    }
    if (skill && skill !== 'all') {
      query.skill = { $regex: skill, $options: 'i' };
    }
    if (status && status !== 'all') {
      query.status = status;
    }
    if (participantLevel && participantLevel !== 'all') {
      query.participantLevel = { $in: [participantLevel, 'all'] };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { skill: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Update statuses before fetching
    await Challenge.updateMany(
      { startDate: { $lte: new Date() }, endDate: { $gte: new Date() }, status: 'upcoming' },
      { status: 'active' }
    );
    await Challenge.updateMany(
      { endDate: { $lt: new Date() }, status: { $in: ['upcoming', 'active'] } },
      { status: 'completed' }
    );

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const challenges = await Challenge.find(query)
      .sort({ startDate: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name');

    const total = await Challenge.countDocuments(query);

    res.json({
      success: true,
      challenges,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Get challenges error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch challenges' });
  }
};

// Get single challenge by ID
export const getChallengeById = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('participants.userId', 'name email');

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    // Check if user is registered
    const isRegistered = challenge.participants.some(
      p => p.userId && p.userId._id.toString() === req.user.id
    );

    res.json({ success: true, challenge, isRegistered });
  } catch (error) {
    console.error('Get challenge error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch challenge' });
  }
};

// Register for a challenge
export const registerForChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    // Check if already registered
    const alreadyRegistered = challenge.participants.some(
      p => p.userId && p.userId.toString() === req.user.id
    );

    if (alreadyRegistered) {
      return res.status(400).json({ success: false, message: 'Already registered for this challenge' });
    }

    // Check if challenge is completed
    if (challenge.status === 'completed') {
      return res.status(400).json({ success: false, message: 'This challenge has ended' });
    }

    // Check max participants
    if (challenge.participants.length >= challenge.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Challenge is full' });
    }

    challenge.participants.push({
      userId: req.user.id,
      registeredAt: new Date(),
      status: 'registered'
    });

    await challenge.save();

    res.json({ success: true, message: 'Successfully registered for challenge' });
  } catch (error) {
    console.error('Register for challenge error:', error);
    res.status(500).json({ success: false, message: 'Failed to register for challenge' });
  }
};

// Submit challenge solution
export const submitChallenge = async (req, res) => {
  try {
    const { totalScore, taskProgress, timeSpent, answers, codeAnswers } = req.body;
    const challenge = await Challenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    const participantIndex = challenge.participants.findIndex(
      p => p.userId && p.userId.toString() === req.user.id
    );

    if (participantIndex === -1) {
      return res.status(400).json({ success: false, message: 'Not registered for this challenge' });
    }

    // Update participant status
    challenge.participants[participantIndex].status = 'completed';
    challenge.participants[participantIndex].score = totalScore || 0;
    challenge.participants[participantIndex].submittedAt = new Date();

    await challenge.save();

    // Award XP for completing challenge
    const user = await User.findById(req.user.id);
    let xpAwarded = 0;
    let leveledUp = false;
    let newLevel = user?.gamification?.level || 1;

    if (user) {
      // Base XP for completing a challenge
      xpAwarded = XP_REWARDS.CHALLENGE_COMPLETED || 100;
      
      // Bonus XP based on score (up to 200 bonus XP)
      const maxScore = challenge.tasks?.reduce((sum, t) => sum + (t.points || 10), 0) || 100;
      const scorePercentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
      
      if (scorePercentage >= 90) {
        xpAwarded += 200; // Excellent performance bonus
      } else if (scorePercentage >= 70) {
        xpAwarded += 100; // Good performance bonus
      } else if (scorePercentage >= 50) {
        xpAwarded += 50; // Completion bonus
      }

      // Award the XP
      const xpResult = await awardXp(user, xpAwarded, 'challenge_completion');
      leveledUp = xpResult.leveledUp;
      newLevel = xpResult.level;

      // Update user's challenge count
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { 'gamification.totalChallengesCompleted': 1 }
      });
    }

    // Calculate user's rank in this challenge
    const sortedParticipants = challenge.participants
      .filter(p => p.status === 'completed')
      .sort((a, b) => b.score - a.score);
    
    const userRank = sortedParticipants.findIndex(
      p => p.userId.toString() === req.user.id
    ) + 1;

    res.json({ 
      success: true, 
      message: 'Challenge completed successfully!',
      result: {
        score: totalScore,
        rank: userRank,
        totalParticipants: sortedParticipants.length
      },
      xpEarned: xpAwarded,
      leveledUp,
      newLevel,
      rankTitle: getRank(newLevel).name
    });
  } catch (error) {
    console.error('Submit challenge error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit challenge' });
  }
};

// Get user's challenges
export const getUserChallenges = async (req, res) => {
  try {
    const challenges = await Challenge.find({
      'participants.userId': req.user.id
    }).sort({ startDate: -1 });

    const userChallenges = challenges.map(challenge => {
      const participant = challenge.participants.find(
        p => p.userId && p.userId.toString() === req.user.id
      );
      return {
        ...challenge.toObject(),
        userStatus: participant?.status,
        userScore: participant?.score,
        userRank: participant?.rank
      };
    });

    res.json({ success: true, challenges: userChallenges });
  } catch (error) {
    console.error('Get user challenges error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user challenges' });
  }
};

// Get challenge leaderboard
export const getChallengeLeaderboard = async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('participants.userId', 'name email');

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    const leaderboard = challenge.participants
      .filter(p => p.status === 'submitted' || p.status === 'completed')
      .sort((a, b) => b.score - a.score)
      .map((p, index) => ({
        rank: index + 1,
        name: p.userId?.name || 'Anonymous',
        score: p.score,
        submittedAt: p.submittedAt
      }));

    res.json({ success: true, leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch leaderboard' });
  }
};

// Create a new challenge (admin/instructor)
export const createChallenge = async (req, res) => {
  try {
    const challengeData = {
      ...req.body,
      createdBy: req.user.id
    };

    const challenge = new Challenge(challengeData);
    await challenge.save();

    res.status(201).json({ success: true, challenge, message: 'Challenge created successfully' });
  } catch (error) {
    console.error('Create challenge error:', error);
    res.status(500).json({ success: false, message: 'Failed to create challenge' });
  }
};

// Update challenge
export const updateChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    res.json({ success: true, challenge, message: 'Challenge updated successfully' });
  } catch (error) {
    console.error('Update challenge error:', error);
    res.status(500).json({ success: false, message: 'Failed to update challenge' });
  }
};

// Delete challenge
export const deleteChallenge = async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndDelete(req.params.id);

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Challenge not found' });
    }

    res.json({ success: true, message: 'Challenge deleted successfully' });
  } catch (error) {
    console.error('Delete challenge error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete challenge' });
  }
};

// Get challenge stats
export const getChallengeStats = async (req, res) => {
  try {
    const [
      totalChallenges,
      activeChallenges,
      upcomingChallenges,
      completedChallenges
    ] = await Promise.all([
      Challenge.countDocuments({ isActive: true }),
      Challenge.countDocuments({ status: 'active', isActive: true }),
      Challenge.countDocuments({ status: 'upcoming', isActive: true }),
      Challenge.countDocuments({ status: 'completed', isActive: true })
    ]);

    // Get user's participation stats
    const userChallenges = await Challenge.find({
      'participants.userId': req.user.id
    });

    const participated = userChallenges.length;
    const completed = userChallenges.filter(c => {
      const p = c.participants.find(p => p.userId?.toString() === req.user.id);
      return p?.status === 'submitted' || p?.status === 'completed';
    }).length;

    res.json({
      success: true,
      stats: {
        totalChallenges,
        activeChallenges,
        upcomingChallenges,
        completedChallenges,
        userParticipated: participated,
        userCompleted: completed
      }
    });
  } catch (error) {
    console.error('Get challenge stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
};

// Generate AI Challenge
export const generateChallenge = async (req, res) => {
  try {
    const { eventType, skill, difficulty, duration, participantLevel } = req.body;

    // Sample generated challenges based on input
    const generatedChallenges = {
      'weekly-challenge': generateWeeklyChallenge(skill, difficulty, duration),
      'live-quiz': generateLiveQuiz(skill, difficulty, duration),
      'skill-sprint': generateSkillSprint(skill, difficulty, duration),
      'hackathon': generateHackathon(skill, difficulty, duration)
    };

    const challengeTemplate = generatedChallenges[eventType] || generatedChallenges['weekly-challenge'];
    
    // Set dates
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // Start tomorrow
    
    const durationMinutes = parseDuration(duration);
    const endDate = new Date(startDate);
    if (eventType === 'hackathon') {
      endDate.setDate(endDate.getDate() + 2);
    } else if (eventType === 'weekly-challenge') {
      endDate.setDate(endDate.getDate() + 7);
    } else {
      endDate.setMinutes(endDate.getMinutes() + durationMinutes);
    }

    const challenge = {
      ...challengeTemplate,
      eventType,
      skill,
      difficulty,
      duration,
      durationMinutes,
      participantLevel,
      startDate,
      endDate,
      registrationDeadline: new Date(endDate),
      status: 'upcoming',
      isActive: true
    };

    res.json({ success: true, challenge });
  } catch (error) {
    console.error('Generate challenge error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate challenge' });
  }
};

// Seed initial challenges
export const seedChallenges = async (req, res) => {
  try {
    // Check if challenges already exist
    const existingCount = await Challenge.countDocuments();
    if (existingCount > 0) {
      return res.json({ success: true, message: 'Challenges already seeded', count: existingCount });
    }

    const now = new Date();
    
    const challenges = [
      {
        title: 'JavaScript Weekly Challenge - Array Mastery',
        description: 'Master JavaScript arrays with practical coding challenges. Implement custom array methods and solve complex problems.',
        eventType: 'weekly-challenge',
        skill: 'JavaScript',
        difficulty: 'intermediate',
        duration: '7 days',
        durationMinutes: 10080,
        participantLevel: 'all',
        startDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        status: 'active',
        maxParticipants: 100,
        tasks: [
          { title: 'Array Manipulation', description: 'Implement custom array methods without using built-in functions', points: 25, type: 'coding' },
          { title: 'Async Operations', description: 'Build a promise-based data fetching utility', points: 30, type: 'coding' },
          { title: 'DOM Challenge', description: 'Create an interactive UI component', points: 25, type: 'coding' },
          { title: 'Algorithm Challenge', description: 'Solve optimization problem', points: 20, type: 'coding' }
        ],
        rules: ['Submit within 7 days', 'Original code only', 'Use vanilla JavaScript', 'Include comments'],
        scoringCriteria: [
          { criterion: 'Correctness', weight: 40, description: 'All test cases pass' },
          { criterion: 'Code Quality', weight: 30, description: 'Clean code' },
          { criterion: 'Performance', weight: 20, description: 'Optimal complexity' },
          { criterion: 'Documentation', weight: 10, description: 'Clear comments' }
        ],
        learningOutcomes: ['Master JavaScript arrays', 'Improve problem-solving', 'Write cleaner code'],
        prizes: [
          { rank: 1, prize: '🥇 Gold Badge + 500 XP', description: 'Top performer' },
          { rank: 2, prize: '🥈 Silver Badge + 300 XP', description: 'Runner up' },
          { rank: 3, prize: '🥉 Bronze Badge + 200 XP', description: 'Third place' }
        ],
        tags: ['JavaScript', 'Arrays', 'Coding'],
        isActive: true
      },
      {
        title: 'Live Python Quiz - Data Structures',
        description: 'Test your Python data structures knowledge in this fast-paced live quiz. 30 questions in 30 minutes!',
        eventType: 'live-quiz',
        skill: 'Python',
        difficulty: 'beginner',
        duration: '30 minutes',
        durationMinutes: 30,
        participantLevel: 'students',
        startDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
        registrationDeadline: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000),
        status: 'upcoming',
        maxParticipants: 200,
        tasks: [
          { title: 'Quick Fire Round', description: '10 rapid questions', points: 30, type: 'quiz' },
          { title: 'Concept Check', description: '5 conceptual questions', points: 25, type: 'quiz' },
          { title: 'Code Analysis', description: 'Analyze code snippets', points: 25, type: 'quiz' },
          { title: 'Bonus Round', description: 'Extra points', points: 20, type: 'quiz' }
        ],
        rules: ['Join 5 min before', 'No external resources', 'Answer within time'],
        scoringCriteria: [
          { criterion: 'Accuracy', weight: 50, description: 'Correct answers' },
          { criterion: 'Speed', weight: 30, description: 'Time taken' },
          { criterion: 'Streak', weight: 20, description: 'Consecutive correct' }
        ],
        learningOutcomes: ['Test knowledge', 'Identify gaps', 'Improve speed'],
        prizes: [
          { rank: 1, prize: '🏆 Quiz Champion + 300 XP', description: 'Highest score' },
          { rank: 2, prize: '⚡ Speed Demon + 200 XP', description: 'Fastest answers' }
        ],
        tags: ['Python', 'Quiz', 'Data Structures'],
        isActive: true
      },
      {
        title: 'React Skill Sprint - Build a Todo App',
        description: 'A 2-hour sprint to build a fully functional Todo app with React. Perfect for practicing rapid development!',
        eventType: 'skill-sprint',
        skill: 'React',
        difficulty: 'intermediate',
        duration: '2 hours',
        durationMinutes: 120,
        participantLevel: 'all',
        startDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        registrationDeadline: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        status: 'upcoming',
        maxParticipants: 50,
        tasks: [
          { title: 'Setup & Planning', description: 'Set up project (10 min)', points: 10, type: 'project' },
          { title: 'Core Implementation', description: 'Build main functionality', points: 40, type: 'coding' },
          { title: 'Enhancement', description: 'Add extra features', points: 30, type: 'coding' },
          { title: 'Documentation', description: 'Document solution', points: 20, type: 'project' }
        ],
        rules: ['Complete within time', 'Start from scratch', 'Submit before timer ends'],
        scoringCriteria: [
          { criterion: 'Completion', weight: 35, description: 'Tasks completed' },
          { criterion: 'Quality', weight: 30, description: 'Code quality' },
          { criterion: 'Creativity', weight: 20, description: 'Innovation' },
          { criterion: 'Presentation', weight: 15, description: 'Documentation' }
        ],
        learningOutcomes: ['Build under pressure', 'Rapid prototyping', 'Time management'],
        prizes: [
          { rank: 1, prize: '🚀 Sprint Master + 400 XP', description: 'Best overall' },
          { rank: 2, prize: '💡 Innovation Award + 250 XP', description: 'Most creative' }
        ],
        tags: ['React', 'Sprint', 'Frontend'],
        isActive: true
      },
      {
        title: 'Full Stack Hackathon 2025',
        description: 'Build an innovative full-stack application in 48 hours. Teams of up to 4 members. Amazing prizes await!',
        eventType: 'hackathon',
        skill: 'Full Stack',
        difficulty: 'advanced',
        duration: '48 hours',
        durationMinutes: 2880,
        participantLevel: 'professionals',
        startDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
        status: 'upcoming',
        maxParticipants: 200,
        tasks: [
          { title: 'Problem Statement', description: 'Analyze the problem', points: 10, type: 'analysis' },
          { title: 'Solution Design', description: 'Design architecture', points: 15, type: 'design' },
          { title: 'Development', description: 'Build complete solution', points: 45, type: 'project' },
          { title: 'Demo & Pitch', description: 'Present solution', points: 20, type: 'project' },
          { title: 'Documentation', description: 'Project docs', points: 10, type: 'project' }
        ],
        rules: ['48 hours', 'Teams 1-4', 'Original work', 'Submit with demo'],
        scoringCriteria: [
          { criterion: 'Innovation', weight: 25, description: 'Creativity' },
          { criterion: 'Technical', weight: 25, description: 'Code quality' },
          { criterion: 'Functionality', weight: 25, description: 'Features' },
          { criterion: 'Presentation', weight: 15, description: 'Demo quality' },
          { criterion: 'Impact', weight: 10, description: 'Real-world impact' }
        ],
        learningOutcomes: ['Build end-to-end', 'Hackathon experience', 'Presentation skills'],
        prizes: [
          { rank: 1, prize: '🏆 Grand Winner + 1000 XP', description: 'Best project' },
          { rank: 2, prize: '🥈 Runner-up + 600 XP', description: 'Second best' },
          { rank: 3, prize: '🥉 Third Place + 400 XP', description: 'Third best' }
        ],
        tags: ['Hackathon', 'Full Stack', 'Team'],
        isActive: true
      },
      {
        title: 'Node.js API Design Challenge',
        description: 'Design and build RESTful APIs with Node.js and Express. Focus on best practices and scalability.',
        eventType: 'weekly-challenge',
        skill: 'Node.js',
        difficulty: 'intermediate',
        duration: '7 days',
        durationMinutes: 10080,
        participantLevel: 'all',
        startDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        registrationDeadline: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000),
        status: 'upcoming',
        maxParticipants: 100,
        tasks: [
          { title: 'API Design', description: 'Design REST endpoints', points: 25, type: 'design' },
          { title: 'Implementation', description: 'Build the API', points: 35, type: 'coding' },
          { title: 'Authentication', description: 'Add JWT auth', points: 20, type: 'coding' },
          { title: 'Documentation', description: 'API docs with Swagger', points: 20, type: 'project' }
        ],
        rules: ['Use Express.js', 'Include tests', 'Follow REST standards'],
        scoringCriteria: [
          { criterion: 'Functionality', weight: 40, description: 'API works correctly' },
          { criterion: 'Design', weight: 25, description: 'Clean architecture' },
          { criterion: 'Security', weight: 20, description: 'Secure implementation' },
          { criterion: 'Documentation', weight: 15, description: 'Clear docs' }
        ],
        learningOutcomes: ['Master Node.js APIs', 'Learn REST best practices', 'Improve backend skills'],
        prizes: [
          { rank: 1, prize: '🥇 API Master + 500 XP', description: 'Best API' },
          { rank: 2, prize: '🥈 Silver + 300 XP', description: 'Runner up' }
        ],
        tags: ['Node.js', 'API', 'Backend'],
        isActive: true
      },
      {
        title: 'SQL Query Mastery Quiz',
        description: 'Prove your SQL skills in this live quiz covering JOINs, subqueries, and optimization.',
        eventType: 'live-quiz',
        skill: 'SQL',
        difficulty: 'intermediate',
        duration: '45 minutes',
        durationMinutes: 45,
        participantLevel: 'all',
        startDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
        registrationDeadline: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        status: 'upcoming',
        maxParticipants: 150,
        tasks: [
          { title: 'Basic Queries', description: 'SELECT, WHERE, ORDER BY', points: 20, type: 'quiz' },
          { title: 'JOINs', description: 'All types of JOINs', points: 30, type: 'quiz' },
          { title: 'Subqueries', description: 'Nested queries', points: 25, type: 'quiz' },
          { title: 'Optimization', description: 'Query performance', points: 25, type: 'quiz' }
        ],
        rules: ['Answer within time', 'No external help', 'Single attempt'],
        scoringCriteria: [
          { criterion: 'Accuracy', weight: 60, description: 'Correct answers' },
          { criterion: 'Speed', weight: 40, description: 'Response time' }
        ],
        learningOutcomes: ['Master SQL queries', 'Understand JOINs', 'Learn optimization'],
        prizes: [
          { rank: 1, prize: '🏆 SQL Master + 350 XP', description: 'Top scorer' }
        ],
        tags: ['SQL', 'Database', 'Quiz'],
        isActive: true
      }
    ];

    await Challenge.insertMany(challenges);
    
    res.json({ success: true, message: 'Challenges seeded successfully', count: challenges.length });
  } catch (error) {
    console.error('Seed challenges error:', error);
    res.status(500).json({ success: false, message: 'Failed to seed challenges' });
  }
};

// Helper functions
function parseDuration(duration) {
  const match = duration.match(/(\d+)\s*(h|m|hour|min|day)/i);
  if (match) {
    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();
    if (unit.startsWith('h')) return value * 60;
    if (unit.startsWith('d')) return value * 60 * 24;
    return value;
  }
  return 60;
}

function generateWeeklyChallenge(skill, difficulty) {
  return {
    title: `Weekly ${skill} ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Challenge`,
    description: `Put your ${skill} skills to the test with this week's comprehensive challenge.`,
    tasks: [
      { title: 'Fundamentals', description: `Demonstrate core ${skill} concepts`, points: 25, type: 'coding' },
      { title: 'Practical Application', description: `Build a real-world ${skill} solution`, points: 30, type: 'project' },
      { title: 'Problem Solving', description: 'Solve complex problems efficiently', points: 25, type: 'coding' },
      { title: 'Best Practices', description: 'Implement using industry standards', points: 20, type: 'coding' }
    ],
    rules: ['Complete within 7 days', 'Original work only', 'Follow coding standards', 'Include documentation'],
    scoringCriteria: [
      { criterion: 'Correctness', weight: 40, description: 'Solution works correctly' },
      { criterion: 'Quality', weight: 30, description: 'Code quality and structure' },
      { criterion: 'Efficiency', weight: 20, description: 'Performance optimization' },
      { criterion: 'Documentation', weight: 10, description: 'Clear documentation' }
    ],
    learningOutcomes: [`Deepen ${skill} knowledge`, 'Improve problem-solving', 'Learn best practices', 'Build portfolio'],
    tags: [skill, 'Challenge', 'Coding'],
    prizes: [
      { rank: 1, prize: '🥇 Gold Badge + 500 XP', description: 'Top performer' },
      { rank: 2, prize: '🥈 Silver Badge + 300 XP', description: 'Runner up' },
      { rank: 3, prize: '🥉 Bronze Badge + 200 XP', description: 'Third place' }
    ]
  };
}

function generateLiveQuiz(skill, difficulty) {
  return {
    title: `Live ${skill} Quiz - ${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level`,
    description: `Test your ${skill} knowledge in this fast-paced live quiz!`,
    tasks: [
      { title: 'Quick Fire', description: '10 rapid questions', points: 30, type: 'quiz' },
      { title: 'Concepts', description: '5 conceptual questions', points: 25, type: 'quiz' },
      { title: 'Code Analysis', description: 'Analyze snippets', points: 25, type: 'quiz' },
      { title: 'Bonus', description: 'Extra points', points: 20, type: 'quiz' }
    ],
    rules: ['Join early', 'No external resources', 'Answer within time'],
    scoringCriteria: [
      { criterion: 'Accuracy', weight: 50, description: 'Correct answers' },
      { criterion: 'Speed', weight: 30, description: 'Time taken' },
      { criterion: 'Streak', weight: 20, description: 'Consecutive correct' }
    ],
    learningOutcomes: ['Test knowledge', 'Improve speed', 'Identify gaps'],
    tags: [skill, 'Quiz', 'Live'],
    prizes: [
      { rank: 1, prize: '🏆 Champion + 300 XP', description: 'Top scorer' },
      { rank: 2, prize: '⚡ Speed Award + 200 XP', description: 'Fastest' }
    ]
  };
}

function generateSkillSprint(skill, difficulty) {
  return {
    title: `${skill} Skill Sprint`,
    description: `A focused sprint to build a ${skill} project quickly!`,
    tasks: [
      { title: 'Setup', description: 'Project setup (10 min)', points: 10, type: 'project' },
      { title: 'Core', description: 'Main functionality', points: 40, type: 'coding' },
      { title: 'Enhance', description: 'Add features', points: 30, type: 'coding' },
      { title: 'Document', description: 'Write docs', points: 20, type: 'project' }
    ],
    rules: ['Complete in time', 'Start fresh', 'Submit before timer'],
    scoringCriteria: [
      { criterion: 'Completion', weight: 35, description: 'Tasks done' },
      { criterion: 'Quality', weight: 30, description: 'Code quality' },
      { criterion: 'Creativity', weight: 20, description: 'Innovation' },
      { criterion: 'Docs', weight: 15, description: 'Documentation' }
    ],
    learningOutcomes: ['Build fast', 'Rapid prototyping', 'Time management'],
    tags: [skill, 'Sprint', 'Fast'],
    prizes: [
      { rank: 1, prize: '🚀 Sprint Master + 400 XP', description: 'Best overall' },
      { rank: 2, prize: '💡 Innovation + 250 XP', description: 'Most creative' }
    ]
  };
}

function generateHackathon(skill, difficulty) {
  return {
    title: `${skill} Hackathon`,
    description: `Build something amazing with ${skill} in 48 hours!`,
    tasks: [
      { title: 'Problem', description: 'Understand problem', points: 10, type: 'analysis' },
      { title: 'Design', description: 'Architecture design', points: 15, type: 'design' },
      { title: 'Build', description: 'Development', points: 45, type: 'project' },
      { title: 'Demo', description: 'Present solution', points: 20, type: 'project' },
      { title: 'Docs', description: 'Documentation', points: 10, type: 'project' }
    ],
    rules: ['48 hours', 'Teams allowed', 'Original work', 'Submit demo'],
    scoringCriteria: [
      { criterion: 'Innovation', weight: 25, description: 'Creativity' },
      { criterion: 'Technical', weight: 25, description: 'Code quality' },
      { criterion: 'Function', weight: 25, description: 'Features' },
      { criterion: 'Demo', weight: 15, description: 'Presentation' },
      { criterion: 'Impact', weight: 10, description: 'Real-world use' }
    ],
    learningOutcomes: ['End-to-end build', 'Hackathon experience', 'Teamwork'],
    tags: [skill, 'Hackathon', 'Team'],
    prizes: [
      { rank: 1, prize: '🏆 Grand Winner + 1000 XP', description: 'Best project' },
      { rank: 2, prize: '🥈 Runner-up + 600 XP', description: 'Second' },
      { rank: 3, prize: '🥉 Third + 400 XP', description: 'Third' }
    ]
  };
}
