import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    required: false  // Made optional for AI-generated exams
  },
  skillName: {
    type: String,
    required: true  // Use skillName as the primary identifier
  },
  certificateId: {
    type: String,
    unique: true
  },
  issuedDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: Date,
  score: Number,
  status: {
    type: String,
    enum: ['active', 'expired', 'revoked'],
    default: 'active'
  },
  verificationUrl: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

certificateSchema.pre('save', async function(next) {
  if (!this.certificateId) {
    this.certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  next();
});

export default mongoose.model('Certificate', certificateSchema);
