const AISession = require('../models/AISession');
const Message = require('../models/Message');
const User = require('../models/User');
const nlp = require('compromise');

class AISessionService {
  // Create a new AI session
  static async createSession(userId, sessionId, metadata = {}) {
    try {
      // Check if user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // End any existing active sessions for this user
      await AISession.updateMany(
        { userId, status: 'active' },
        { status: 'ended', endTime: new Date() }
      );

      // Create new session
      const session = new AISession({
        sessionId,
        userId,
        metadata: {
          userAgent: metadata.userAgent || '',
          ipAddress: metadata.ipAddress || '',
          deviceInfo: metadata.deviceInfo || '',
          topics: [],
          lastActivity: new Date()
        }
      });

      await session.save();
      return { success: true, session };
    } catch (error) {
      console.error('Error creating AI session:', error);
      return { success: false, error: error.message };
    }
  }

  // End an AI session
  static async endSession(sessionId, userId) {
    try {
      const session = await AISession.findOne({ sessionId, userId });
      if (!session) {
        throw new Error('Session not found');
      }

      await session.endSession();
      return { success: true, session };
    } catch (error) {
      console.error('Error ending AI session:', error);
      return { success: false, error: error.message };
    }
  }

  // Save a message to the database
  static async saveMessage(sessionId, userId, messageData) {
    try {
      const session = await AISession.findOne({ sessionId, userId });
      if (!session) {
        throw new Error('Session not found');
      }

      const message = new Message({
        sessionId,
        userId,
        senderType: messageData.senderType,
        content: messageData.content,
        messageType: messageData.messageType || 'text',
        metadata: {
          screenSnapshot: messageData.screenSnapshot || null,
          voiceUrl: messageData.voiceUrl || null,
          context: messageData.context || null,
          tokens: messageData.tokens || null,
          processingTime: messageData.processingTime || null,
          aiModel: messageData.aiModel || null,
          confidence: messageData.confidence || null,
          topics: messageData.topics || []
        }
      });

      await message.save();

      // Update session statistics
      session.messageCount += 1;
      if (messageData.senderType === 'ai') {
        session.aiResponseCount += 1;
      }
      await session.updateActivity();

      return { success: true, message };
    } catch (error) {
      console.error('Error saving message:', error);
      return { success: false, error: error.message };
    }
  }

  // Get conversation history for a session
  static async getSessionHistory(sessionId, userId, limit = 50) {
    try {
      const messages = await Message.find({ sessionId, userId })
        .sort({ createdAt: 1 })
        .limit(limit)
        .populate('userId', 'firstName lastName email');

      return { success: true, messages };
    } catch (error) {
      console.error('Error getting session history:', error);
      return { success: false, error: error.message };
    }
  }

  // Get user's AI session statistics
  static async getUserStats(userId) {
    try {
      const stats = await AISession.getUserStats(userId);
      const recentSessions = await AISession.find({ userId })
        .sort({ startTime: -1 })
        .limit(10);

      return {
        success: true,
        stats: stats[0] || {
          totalSessions: 0,
          totalDuration: 0,
          totalMessages: 0,
          totalAIResponses: 0,
          avgSessionDuration: 0
        },
        recentSessions
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return { success: false, error: error.message };
    }
  }

  // Get active session for a user
  static async getActiveSession(userId) {
    try {
      const session = await AISession.findActiveByUser(userId);
      return { success: true, session };
    } catch (error) {
      console.error('Error getting active session:', error);
      return { success: false, error: error.message };
    }
  }

  // Update session metadata (topics, etc.)
  static async updateSessionMetadata(sessionId, userId, metadata) {
    try {
      const session = await AISession.findOne({ sessionId, userId });
      if (!session) {
        throw new Error('Session not found');
      }

      if (metadata.topics) {
        session.metadata.topics = [...new Set([...session.metadata.topics, ...metadata.topics])];
      }

      if (metadata.userAgent) session.metadata.userAgent = metadata.userAgent;
      if (metadata.ipAddress) session.metadata.ipAddress = metadata.ipAddress;
      if (metadata.deviceInfo) session.metadata.deviceInfo = metadata.deviceInfo;

      await session.updateActivity();
      return { success: true, session };
    } catch (error) {
      console.error('Error updating session metadata:', error);
      return { success: false, error: error.message };
    }
  }

  // Update session summary
  static async updateSessionSummary(sessionId, userId, summary) {
    try {
      const session = await AISession.findOne({ sessionId, userId });
      if (!session) {
        throw new Error('Session not found');
      }
      session.summary = summary;
      await session.save();
      return { success: true, session };
    } catch (error) {
      console.error('Error updating session summary:', error);
      return { success: false, error: error.message };
    }
  }

  // Get session summary
  static async getSessionSummary(sessionId, userId) {
    try {
      const session = await AISession.findOne({ sessionId, userId });
      if (!session) {
        throw new Error('Session not found');
      }
      return { success: true, summary: session.summary || '' };
    } catch (error) {
      console.error('Error getting session summary:', error);
      return { success: false, error: error.message };
    }
  }

  // Clean up old sessions (for maintenance)
  static async cleanupOldSessions(daysOld = 30) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await AISession.deleteMany({
        status: 'ended',
        endTime: { $lt: cutoffDate }
      });

      return { success: true, deletedCount: result.deletedCount };
    } catch (error) {
      console.error('Error cleaning up old sessions:', error);
      return { success: false, error: error.message };
    }
  }

  // Extract entities and intent from a message
  static extractEntitiesAndIntent(message) {
    const doc = nlp(message);
    const entities = {};
    // Extract country names
    const countries = doc.match('#Country').out('array');
    if (countries.length > 0) entities.country = countries[countries.length - 1];
    // Extract person names
    const people = doc.people().out('array');
    if (people.length > 0) entities.person = people[people.length - 1];
    // Extract topics (nouns)
    const topics = doc.nouns().out('array');
    if (topics.length > 0) entities.topic = topics[topics.length - 1];
    // Simple intent detection
    let intent = 'unknown';
    if (/who\s+is|what\s+is|tell\s+me|define|explain/i.test(message)) intent = 'ask_info';
    else if (/help|assist|how\s+do|can\s+you/i.test(message)) intent = 'request_help';
    else if (/where\s+is|location|find/i.test(message)) intent = 'ask_location';
    else if (/when\s+is|date|time/i.test(message)) intent = 'ask_time';
    else if (/why|reason/i.test(message)) intent = 'ask_reason';
    return { entities, intent };
  }

  // Update session metadata with new entities/intents
  static async updateSessionEntitiesAndIntent(sessionId, userId, message) {
    try {
      const session = await AISession.findOne({ sessionId, userId });
      if (!session) throw new Error('Session not found');
      const { entities, intent } = this.extractEntitiesAndIntent(message);
      // Merge new entities into topics
      if (entities.topic) {
        session.metadata.topics = Array.from(new Set([...(session.metadata.topics || []), entities.topic]));
      }
      // Store latest country/person/intent
      if (entities.country) session.metadata.country = entities.country;
      if (entities.person) session.metadata.person = entities.person;
      session.metadata.lastIntent = intent;
      await session.save();
      return { success: true, session, entities, intent };
    } catch (error) {
      console.error('Error updating session entities/intent:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = AISessionService; 