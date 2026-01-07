import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String },
  skills: [{ type: String }],
  duration: { type: String },
  durationWeeks: { type: Number },
  status: { type: String, enum: ['not-started', 'in-progress', 'completed'], default: 'not-started' },
  completedAt: Date
});

const examItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  skill: { type: String },
  difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
  estimatedScore: { type: Number },
  status: { type: String, enum: ['pending', 'passed', 'failed'], default: 'pending' },
  order: { type: Number }
});

const courseItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  provider: { type: String },
  url: { type: String },
  duration: { type: String },
  type: { type: String, enum: ['video', 'live-session', 'reading', 'project'], default: 'video' },
  priority: { type: String, enum: ['essential', 'recommended', 'optional'], default: 'recommended' },
  completed: { type: Boolean, default: false }
});

const careerRoadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  careerGoal: {
    type: String,
    required: true
  },
  currentLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  targetRole: {
    type: String,
    required: true
  },
  industry: {
    type: String
  },
  estimatedTimeWeeks: {
    type: Number,
    required: true
  },
  estimatedTimeDisplay: {
    type: String
  },
  milestones: [milestoneSchema],
  requiredSkills: [{
    name: { type: String, required: true },
    category: { type: String },
    proficiencyLevel: { type: String, enum: ['basic', 'intermediate', 'advanced', 'expert'] },
    currentLevel: { type: Number, default: 0 },
    targetLevel: { type: Number, default: 100 },
    priority: { type: Number }
  }],
  exams: [examItemSchema],
  courses: [courseItemSchema],
  liveSessions: [{
    title: { type: String },
    description: { type: String },
    scheduledDate: { type: Date },
    duration: { type: String },
    instructor: { type: String },
    topic: { type: String },
    zoomMeetingId: { type: String },
    zoomJoinUrl: { type: String },
    zoomStartUrl: { type: String },
    zoomPassword: { type: String },
    isMockMeeting: { type: Boolean, default: false },
    status: { type: String, enum: ['scheduled', 'live', 'completed', 'cancelled'], default: 'scheduled' },
    registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    recordingUrl: { type: String }
  }],
  progress: {
    overall: { type: Number, default: 0 },
    skillsCompleted: { type: Number, default: 0 },
    examsCleared: { type: Number, default: 0 },
    coursesCompleted: { type: Number, default: 0 },
    milestonesCompleted: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed', 'archived'],
    default: 'active'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  estimatedCompletionDate: {
    type: Date
  },
  completedAt: Date,
  notes: String
}, {
  timestamps: true
});

// Calculate progress
careerRoadmapSchema.methods.calculateProgress = function() {
  const totalMilestones = this.milestones.length;
  const completedMilestones = this.milestones.filter(m => m.status === 'completed').length;
  
  const totalExams = this.exams.length;
  const passedExams = this.exams.filter(e => e.status === 'passed').length;
  
  const totalCourses = this.courses.length;
  const completedCourses = this.courses.filter(c => c.completed).length;
  
  const milestonesWeight = 0.4;
  const examsWeight = 0.35;
  const coursesWeight = 0.25;
  
  const milestonesProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
  const examsProgress = totalExams > 0 ? (passedExams / totalExams) * 100 : 0;
  const coursesProgress = totalCourses > 0 ? (completedCourses / totalCourses) * 100 : 0;
  
  this.progress = {
    overall: Math.round(
      milestonesProgress * milestonesWeight +
      examsProgress * examsWeight +
      coursesProgress * coursesWeight
    ),
    skillsCompleted: completedMilestones,
    examsCleared: passedExams,
    coursesCompleted: completedCourses,
    milestonesCompleted: completedMilestones
  };
  
  return this.progress;
};

const CareerRoadmap = mongoose.model('CareerRoadmap', careerRoadmapSchema);

export default CareerRoadmap;
