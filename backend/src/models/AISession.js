const mongoose = require('mongoose');

const aiSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'ended', 'paused'],
    default: 'active'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  messageCount: {
    type: Number,
    default: 0
  },
  aiResponseCount: {
    type: Number,
    default: 0
  },
  screenShareEnabled: {
    type: Boolean,
    default: false
  },
  voiceEnabled: {
    type: Boolean,
    default: true
  },
  summary: {
    type: String,
    default: ''
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    deviceInfo: String,
    topics: [String], // AI conversation topics
    lastActivity: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Index for efficient queries
aiSessionSchema.index({ userId: 1, startTime: -1 });
aiSessionSchema.index({ status: 1, lastActivity: -1 });

// Virtual for session duration
aiSessionSchema.virtual('durationMinutes').get(function() {
  if (this.endTime && this.startTime) {
    return Math.round((this.endTime - this.startTime) / 1000 / 60);
  }
  return 0;
});

// Method to end session
aiSessionSchema.methods.endSession = function() {
  this.status = 'ended';
  this.endTime = new Date();
  this.duration = Math.round((this.endTime - this.startTime) / 1000);
  return this.save();
};

// Method to update last activity
aiSessionSchema.methods.updateActivity = function() {
  this.metadata.lastActivity = new Date();
  return this.save();
};

// Static method to find active sessions for a user
aiSessionSchema.statics.findActiveByUser = function(userId) {
  return this.findOne({ userId, status: 'active' });
};

// Static method to get user session statistics
aiSessionSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        totalDuration: { $sum: '$duration' },
        totalMessages: { $sum: '$messageCount' },
        totalAIResponses: { $sum: '$aiResponseCount' },
        avgSessionDuration: { $avg: '$duration' }
      }
    }
  ]);
};

module.exports = mongoose.model('AISession', aiSessionSchema); 