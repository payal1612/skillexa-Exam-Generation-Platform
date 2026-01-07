import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: Number,
  explanation: String
}, { _id: false });

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  skillName: String,
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill'
  },
  category: String,
  difficulty: {
    type: String,
    enum: ['Novice', 'Intermediate', 'Expert', 'Master'],
    default: 'Intermediate'
  },
  questions: [questionSchema],
  timeLimit: {
    type: Number,
    default: 30
  },
  passingScore: {
    type: Number,
    default: 70
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['active', 'draft', 'archived'],
    default: 'active'
  },
  attempts: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('Exam', examSchema);
