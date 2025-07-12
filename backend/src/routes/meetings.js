const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  startMeeting,
  joinMeeting,
  endMeeting,
  getMeeting,
  getUserMeetings,
} = require('../controllers/meetingController');

// All routes require authentication
router.use(auth);

// Start a new meeting
router.post('/start', startMeeting);

// Join an existing meeting
router.post('/join/:meetingId', joinMeeting);

// End a meeting (only creator can end)
router.post('/end/:meetingId', endMeeting);

// Get meeting details
router.get('/:meetingId', getMeeting);

// Get user's meetings
router.get('/user/meetings', getUserMeetings);

module.exports = router; 