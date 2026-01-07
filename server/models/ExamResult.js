import mongoose from 'mongoose';

const examResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: false // Made optional for AI-generated exams
  },
  skillName: {
    type: String,
    default: 'AI Generated Exam'
  },
  score: {
    type: Number,
    required: true
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  answers: [{
    questionIndex: Number,
    selectedAnswer: Number,
    isCorrect: Boolean
  }],
  timeTaken: Number,
  timeSpent: Number,
  passed: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['passed', 'failed', 'completed', 'in-progress'],
    default: 'completed'
  },
  attemptNumber: {
    type: Number,
    default: 1
  },
  completedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('ExamResult', examResultSchema);
