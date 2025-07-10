const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  meetingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  senderType: {
    type: String,
    enum: ['user', 'ai'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  messageType: {
    type: String,
    enum: ['text', 'voice', 'screen_analysis'],
    default: 'text',
  },
  metadata: {
    screenData: String, // Base64 image data if related to screen
    voiceUrl: String,   // URL to voice file if AI voice response
    context: String,    // Additional context (OCR text, etc.)
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Message', messageSchema); 