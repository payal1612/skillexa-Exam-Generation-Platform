import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  points: { type: Number, default: 10 },
  type: { type: String, enum: ['coding', 'quiz', 'project', 'design', 'analysis'], default: 'coding' }
});

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    enum: ['weekly-challenge', 'live-quiz', 'skill-sprint', 'hackathon'],
    required: true
  },
  skill: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  duration: {
    type: String,
    required: true
  },
  durationMinutes: {
    type: Number,
    required: true
  },
  participantLevel: {
    type: String,
    enum: ['students', 'professionals', 'all'],
    default: 'all'
  },
  tasks: [taskSchema],
  rules: [{
    type: String
  }],
  scoringCriteria: [{
    criterion: String,
    weight: Number,
    description: String
  }],
  learningOutcomes: [{
    type: String
  }],
  prizes: [{
    rank: Number,
    prize: String,
    description: String
  }],
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  registrationDeadline: {
    type: Date
  },
  maxParticipants: {
    type: Number,
    default: 100
  },
  participants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    registeredAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['registered', 'started', 'submitted', 'completed'], default: 'registered' },
    score: { type: Number, default: 0 },
    submittedAt: Date,
    rank: Number
  }],
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [{
    type: String
  }],
  thumbnail: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Virtual for participant count
challengeSchema.virtual('participantCount').get(function() {
  return this.participants ? this.participants.length : 0;
});

// Update status based on dates
challengeSchema.methods.updateStatus = function() {
  const now = new Date();
  if (now < this.startDate) {
    this.status = 'upcoming';
  } else if (now >= this.startDate && now <= this.endDate) {
    this.status = 'active';
  } else {
    this.status = 'completed';
  }
  return this.status;
};

const Challenge = mongoose.model('Challenge', challengeSchema);

export default Challenge;
