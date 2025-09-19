const express = require('express');
const multer = require('multer');
const { storage } = require('../cloudinary');
const InterviewLog = require('../models/InterviewLog');
const Interview = require('../models/Interview');
const User = require('../models/User'); // Import User model for candidate info

const router = express.Router();

const upload = multer({ storage: storage });

// --- Enhanced Deduction points for integrity score calculation ---
const DEDUCTION_POINTS = {
  CANDIDATE_ABSENT: 15,
  MULTIPLE_FACES: 25,
  OBJECT_DETECTED_CELL_PHONE: 20,
  OBJECT_DETECTED_BOOK: 15,
  OBJECT_DETECTED_LAPTOP: 10,
  OBJECT_DETECTED_MOUSE: 5,
  OBJECT_DETECTED_KEYBOARD: 5,
  OBJECT_DETECTED_REMOTE: 10,
  LOOKING_AWAY: 8,
};

// Helper function to format duration in MM:SS
const formatDuration = (startTime, endTime) => {
  const durationMs = new Date(endTime) - new Date(startTime);
  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Helper function to get candidate name from JWT or database
const getCandidateName = async (req, interviewId) => {
  try {
    // Try to get from JWT token first
    if (req.user && req.user.email) {
      const user = await User.findById(req.user.id);
      if (user) {
        return user.email.split('@')[0]; // Use email username as name
      }
    }
    
    // Fallback: generate a name based on interview ID
    const hash = interviewId.slice(-6);
    return `Candidate_${hash}`;
  } catch (error) {
    console.error('Error getting candidate name:', error);
    return 'Anonymous Candidate';
  }
};

/**
 * @route   POST /api/events
 * @desc    Logs a proctoring event from the frontend with enhanced timestamp tracking
 */
router.post('/events', async (req, res) => {
  try {
    const { interviewId, timestamp, eventType, details } = req.body;

    const newLog = new InterviewLog({
      interviewId,
      timestamp: timestamp || new Date().toISOString(),
      eventType,
      details,
    });

    await newLog.save();
    
    // Update or create interview record with latest activity
    await Interview.findOneAndUpdate(
      { interviewId },
      { 
        interviewId,
        lastActivity: new Date(),
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ message: 'Event logged successfully' });
  } catch (error) {
    console.error('Error logging event:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/report/:interviewId
 * @desc    Generates a dynamic proctoring report for a given interview
 */
router.get('/report/:interviewId', async (req, res) => {
  try {
    const { interviewId } = req.params;
    const events = await InterviewLog.find({ interviewId }).sort({ timestamp: 'asc' });

    if (events.length === 0) {
      return res.status(404).json({ message: 'No events found for this interview ID.' });
    }

    // Calculate dynamic interview duration
    const startTime = events[0].timestamp;
    const endTime = events[events.length - 1].timestamp;
    const interviewDuration = formatDuration(startTime, endTime);

    // Calculate integrity score with enhanced deduction system
    let integrityScore = 100;
    let focusLostCount = 0;
    const suspiciousEvents = [];

    events.forEach(event => {
      // Get deduction points for this event type
      let deduction = 0;
      
      if (event.eventType.startsWith('OBJECT_DETECTED_')) {
        deduction = DEDUCTION_POINTS[event.eventType] || DEDUCTION_POINTS.OBJECT_DETECTED_CELL_PHONE;
      } else {
        deduction = DEDUCTION_POINTS[event.eventType] || 10;
      }
      
      integrityScore -= deduction;
      
      // Count focus lost instances
      if (event.eventType === 'LOOKING_AWAY' || event.eventType === 'CANDIDATE_ABSENT') {
        focusLostCount++;
      }
      
      // Add to suspicious events with formatted data
      suspiciousEvents.push({
        timestamp: event.timestamp,
        event: event.eventType,
        details: event.details || null
      });
    });
    
    // Ensure score doesn't go below 0
    integrityScore = Math.max(0, integrityScore);

    // Get dynamic candidate name
    const candidateName = await getCandidateName(req, interviewId);

    // Create comprehensive report with dynamic data
    const report = {
      interviewId: interviewId,
      candidateName: candidateName,
      interviewDuration: interviewDuration,
      integrityScore: integrityScore,
      focusLostCount: focusLostCount,
      suspiciousEvents: suspiciousEvents,
      sessionStats: {
        totalEvents: events.length,
        startTime: startTime,
        endTime: endTime,
        eventsPerMinute: Math.round((events.length / (new Date(endTime) - new Date(startTime))) * 60000 * 100) / 100
      }
    };

    res.status(200).json(report);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @route   GET /api/interviews
 * @desc    Get all interviews with enhanced metadata
 */
// router.get('/interviews', async (req, res) => {
//   try {
//     const interviews = await Interview.find({}, 'interviewId videoUrl createdAt lastActivity').sort({ createdAt: -1 });
    
//     // Enhance with additional metadata
//     const enhancedInterviews = await Promise.all(
//       interviews.map(async (interview) => {
//         const eventCount = await InterviewLog.countDocuments({ interviewId: interview.interviewId });
//         return {
//           interviewId: interview.interviewId,
//           videoUrl: interview.videoUrl,
//           createdAt: interview.createdAt,
//           lastActivity: interview.lastActivity,
//           eventCount: eventCount,
//           hasEvents: eventCount > 0
//         };
//       })
//     );

//     res.json(enhancedInterviews);
//   } catch (error) {
//     console.error('Error fetching interviews:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });
router.get('/interviews', async (req, res) => {
  try {
    // ---> FIX: This now sends the full objects the frontend needs
    const interviews = await Interview.find({}, 'interviewId videoUrl createdAt');
    res.json(interviews);
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
/**
 * @route   POST /api/upload/:interviewId
 * @desc    Uploads a video recording and links it to an interview with metadata
 */
router.post('/upload/:interviewId', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No video file uploaded.');
    }
    
    const videoUrl = req.file.path;
    
    // Update interview with video URL and upload timestamp
    const updatedInterview = await Interview.findOneAndUpdate(
      { interviewId: req.params.interviewId },
      { 
        videoUrl: videoUrl,
        videoUploadedAt: new Date(),
        videoSize: req.file.size,
        videoFormat: req.file.format || 'webm'
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ 
      message: 'Upload successful', 
      videoUrl: videoUrl,
      uploadedAt: updatedInterview.videoUploadedAt
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Server error during upload.' });
  }
});

/**
 * @route   GET /api/session/:interviewId/stats
 * @desc    Get real-time session statistics
 */
router.get('/session/:interviewId/stats', async (req, res) => {
  try {
    const { interviewId } = req.params;
    
    const events = await InterviewLog.find({ interviewId }).sort({ timestamp: 'desc' }).limit(100);
    const totalEvents = await InterviewLog.countDocuments({ interviewId });
    
    if (events.length === 0) {
      return res.json({
        isActive: false,
        totalEvents: 0,
        recentEvents: [],
        lastActivity: null
      });
    }

    const now = new Date();
    const lastEvent = new Date(events[0].timestamp);
    const isActive = (now - lastEvent) < 30000; // Active if last event within 30 seconds

    res.json({
      isActive: isActive,
      totalEvents: totalEvents,
      recentEvents: events.slice(0, 10),
      lastActivity: events[0].timestamp,
      sessionDuration: events.length > 1 ? 
        formatDuration(events[events.length - 1].timestamp, events[0].timestamp) : '00:00'
    });
  } catch (error) {
    console.error('Error fetching session stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;