const Meeting = require('../models/Meeting');
const User = require('../models/User');
const Message = require('../models/Message');

// Start a new meeting
const startMeeting = async (req, res) => {
  try {
    const { userId } = req.user;
    
    // Generate unique meeting ID
    const meetingId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const meeting = new Meeting({
      meetingId,
      createdBy: userId,
      participants: [{ userId, joinedAt: new Date() }],
      status: 'active',
    });

    await meeting.save();

    // Create welcome message
    const welcomeMessage = new Message({
      meetingId: meeting._id,
      senderType: 'ai',
      content: 'Welcome to jerry! I\'m your AI assistant. Share your screen and I\'ll help you with any questions.',
      messageType: 'text',
    });
    await welcomeMessage.save();

    res.status(201).json({
      success: true,
      meeting: {
        id: meeting._id,
        meetingId: meeting.meetingId,
        status: meeting.status,
        createdAt: meeting.createdAt,
      },
      message: 'Meeting created successfully'
    });
  } catch (error) {
    console.error('Start meeting error:', error);
    res.status(500).json({ error: 'Failed to start meeting' });
  }
};

// Join an existing meeting
const joinMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { userId } = req.user;

    const meeting = await Meeting.findOne({ meetingId }).populate('createdBy', 'firstName lastName');
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    if (meeting.status === 'ended') {
      return res.status(400).json({ error: 'Meeting has ended' });
    }

    // Check if user is already a participant
    const existingParticipant = meeting.participants.find(p => p.userId.toString() === userId.toString());
    
    if (!existingParticipant) {
      meeting.participants.push({ userId, joinedAt: new Date() });
      await meeting.save();
    }

    // Get recent messages
    const messages = await Message.find({ meetingId: meeting._id })
      .populate('sender', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      meeting: {
        id: meeting._id,
        meetingId: meeting.meetingId,
        status: meeting.status,
        createdBy: meeting.createdBy,
        participants: meeting.participants,
        settings: meeting.settings,
      },
      messages: messages.reverse(),
      message: 'Joined meeting successfully'
    });
  } catch (error) {
    console.error('Join meeting error:', error);
    res.status(500).json({ error: 'Failed to join meeting' });
  }
};

// End a meeting
const endMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { userId } = req.user;

    const meeting = await Meeting.findOne({ meetingId });
    
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    // Only meeting creator can end the meeting
    if (meeting.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Only meeting creator can end the meeting' });
    }

    meeting.status = 'ended';
    meeting.endedAt = new Date();
    await meeting.save();

    res.json({
      success: true,
      message: 'Meeting ended successfully'
    });
  } catch (error) {
    console.error('End meeting error:', error);
    res.status(500).json({ error: 'Failed to end meeting' });
  }
};

// Get meeting details
const getMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = await Meeting.findOne({ meetingId })
      .populate('createdBy', 'firstName lastName')
      .populate('participants.userId', 'firstName lastName');

    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    res.json({
      success: true,
      meeting
    });
  } catch (error) {
    console.error('Get meeting error:', error);
    res.status(500).json({ error: 'Failed to get meeting details' });
  }
};

// Get user's meetings
const getUserMeetings = async (req, res) => {
  try {
    const { userId } = req.user;

    const meetings = await Meeting.find({
      $or: [
        { createdBy: userId },
        { 'participants.userId': userId }
      ]
    })
    .populate('createdBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(20);

    res.json({
      success: true,
      meetings
    });
  } catch (error) {
    console.error('Get user meetings error:', error);
    res.status(500).json({ error: 'Failed to get user meetings' });
  }
};

module.exports = {
  startMeeting,
  joinMeeting,
  endMeeting,
  getMeeting,
  getUserMeetings,
}; 