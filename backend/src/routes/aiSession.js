const express = require('express');
const router = express.Router();
const AISessionController = require('../controllers/aiSessionController');
const { auth } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(auth);

// Session management routes
router.post('/sessions', AISessionController.createSession);
router.get('/sessions/active', AISessionController.getActiveSession);
router.get('/sessions', AISessionController.getUserSessions);
router.put('/sessions/:sessionId', AISessionController.endSession);
router.patch('/sessions/:sessionId/metadata', AISessionController.updateSessionMetadata);

// Message management routes
router.post('/messages', AISessionController.saveMessage);
router.get('/sessions/:sessionId/messages', AISessionController.getSessionHistory);

// Statistics routes
router.get('/stats', AISessionController.getUserStats);

module.exports = router; 