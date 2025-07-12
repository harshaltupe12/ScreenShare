const AISessionService = require('../services/aiSessionService');
const AISession = require('../models/AISession');

class AISessionController {
  // Create a new AI session
  static async createSession(req, res) {
    try {
      const { sessionId } = req.body;
      const userId = req.user.id;

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error: 'Session ID is required'
        });
      }

      const metadata = {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip || req.connection.remoteAddress,
        deviceInfo: req.headers['sec-ch-ua-platform'] || 'unknown'
      };

      const result = await AISessionService.createSession(userId, sessionId, metadata);

      if (result.success) {
        res.status(201).json({
          success: true,
          message: 'AI session created successfully',
          session: result.session
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error in createSession controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // End an AI session
  static async endSession(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;

      const result = await AISessionService.endSession(sessionId, userId);

      if (result.success) {
        res.json({
          success: true,
          message: 'AI session ended successfully',
          session: result.session
        });
      } else {
        res.status(404).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error in endSession controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Save a message to the session
  static async saveMessage(req, res) {
    try {
      const { sessionId, content, senderType, messageType, metadata } = req.body;
      const userId = req.user.id;

      if (!sessionId || !content || !senderType) {
        return res.status(400).json({
          success: false,
          error: 'Session ID, content, and sender type are required'
        });
      }

      const messageData = {
        senderType,
        content,
        messageType: messageType || 'text',
        ...metadata
      };

      const result = await AISessionService.saveMessage(sessionId, userId, messageData);

      if (result.success) {
        res.status(201).json({
          success: true,
          message: 'Message saved successfully',
          message: result.message
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error in saveMessage controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Get session history
  static async getSessionHistory(req, res) {
    try {
      const { sessionId } = req.params;
      const { limit = 50 } = req.query;
      const userId = req.user.id;

      const result = await AISessionService.getSessionHistory(sessionId, userId, parseInt(limit));

      if (result.success) {
        res.json({
          success: true,
          messages: result.messages
        });
      } else {
        res.status(404).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error in getSessionHistory controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Get user statistics
  static async getUserStats(req, res) {
    try {
      const userId = req.user.id;

      const result = await AISessionService.getUserStats(userId);

      if (result.success) {
        res.json({
          success: true,
          stats: result.stats,
          recentSessions: result.recentSessions
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error in getUserStats controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Get active session
  static async getActiveSession(req, res) {
    try {
      const userId = req.user.id;

      const result = await AISessionService.getActiveSession(userId);

      if (result.success) {
        res.json({
          success: true,
          session: result.session
        });
      } else {
        res.status(404).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error in getActiveSession controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Update session metadata
  static async updateSessionMetadata(req, res) {
    try {
      const { sessionId } = req.params;
      const { metadata } = req.body;
      const userId = req.user.id;

      if (!metadata) {
        return res.status(400).json({
          success: false,
          error: 'Metadata is required'
        });
      }

      const result = await AISessionService.updateSessionMetadata(sessionId, userId, metadata);

      if (result.success) {
        res.json({
          success: true,
          message: 'Session metadata updated successfully',
          session: result.session
        });
      } else {
        res.status(404).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error in updateSessionMetadata controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Get all sessions for a user (admin or user's own sessions)
  static async getUserSessions(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, status } = req.query;

      const query = { userId };
      if (status) {
        query.status = status;
      }

      const sessions = await AISession.find(query)
        .sort({ startTime: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit));

      const total = await AISession.countDocuments(query);

      res.json({
        success: true,
        sessions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error in getUserSessions controller:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

module.exports = AISessionController; 