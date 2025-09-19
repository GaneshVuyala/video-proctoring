const mongoose = require('mongoose');

const interviewLogSchema = new mongoose.Schema({
  interviewId: {
    type: String,
    required: true,
    index: true, // Index for faster queries by interviewId
  },
  timestamp: {
    type: Date,
    required: true,
  },
  eventType: {
    type: String,
    required: true,
    // Example values: 'CANDIDATE_ABSENT', 'LOOKING_AWAY', 'MULTIPLE_FACES', 'OBJECT_DETECTED'
  },
  details: {
    type: Object,
    // Example for OBJECT_DETECTED: { object: "cell phone", confidence: 0.85 }
    // Example for LOOKING_AWAY: { duration: 5 }
  },
});

const InterviewLog = mongoose.model('InterviewLog', interviewLogSchema);

module.exports = InterviewLog;