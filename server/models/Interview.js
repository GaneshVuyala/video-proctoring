const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  interviewId: {
    type: String,
    required: true,
    unique: true,
  },
  videoUrl: {
    type: String,
  },
  videoUploadedAt: {
    type: Date,
  },
  videoSize: {
    type: Number, // Size in bytes
  },
  videoFormat: {
    type: String,
    default: 'webm'
  },
  lastActivity: {
    type: Date,
    default: Date.now,
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProctoringUser',
  },
  sessionStarted: {
    type: Date,
    default: Date.now,
  },
  sessionEnded: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'terminated'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add index for better query performance
interviewSchema.index({ interviewId: 1 });
interviewSchema.index({ createdAt: -1 });
interviewSchema.index({ status: 1 });

const Interview = mongoose.model('Interview', interviewSchema);

module.exports = Interview;