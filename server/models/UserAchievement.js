import mongoose from 'mongoose';

const userAchievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  achievement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement',
    required: true
  },
  unlockedAt: {
    type: Date
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['locked', 'in_progress', 'unlocked'],
    default: 'in_progress'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Virtual for unlocked (for backward compatibility)
userAchievementSchema.virtual('unlocked').get(function() {
  return this.status === 'unlocked';
});

// Virtual for unlockedDate (for backward compatibility)
userAchievementSchema.virtual('unlockedDate').get(function() {
  return this.unlockedAt;
});

userAchievementSchema.set('toJSON', { virtuals: true });
userAchievementSchema.set('toObject', { virtuals: true });

userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });

export default mongoose.model('UserAchievement', userAchievementSchema);
