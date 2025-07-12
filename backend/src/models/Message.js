const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
    enum: ['text', 'voice', 'screen_analysis', 'system'],
    default: 'text',
  },
  metadata: {
    screenSnapshot: String, // Base64 image data if related to screen
    voiceUrl: String,       // URL to voice file if AI voice response
    context: String,        // Additional context (OCR text, etc.)
    tokens: Number,         // Token count for AI responses
    processingTime: Number, // Time taken to process the message
    aiModel: String,        // Which AI model was used
    confidence: Number,     // AI confidence score
    topics: [String],       // Topics detected in the message
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Message', messageSchema); 