console.log('[ROUTES] ai.js loaded');
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  chat,
  chatWithScreenshot,
  processQuery,
  analyzeScreen,
  getChatHistory,
} = require('../controllers/aiController');

// Simple chat endpoint (no auth required)
router.post('/chat', chat);

// Chat with screenshot endpoint (no auth required)
console.log('[ROUTES] Registering /chat-with-screenshot route');
router.post('/chat-with-screenshot', chatWithScreenshot);

// Debug endpoint to test request format
router.post('/debug-request', (req, res) => {
  console.log('[DEBUG] Request received');
  console.log('[DEBUG] Headers:', req.headers);
  console.log('[DEBUG] Body:', req.body);
  console.log('[DEBUG] Body type:', typeof req.body);
  console.log('[DEBUG] Message field:', req.body.message);
  console.log('[DEBUG] Message type:', typeof req.body.message);
  res.json({ 
    success: true, 
    received: req.body,
    message: req.body.message,
    messageType: typeof req.body.message
  });
});

// All other routes require authentication
router.use(auth);

// Process user query and get AI response
router.post('/query', processQuery);

// Analyze screen content
router.post('/analyze-screen', analyzeScreen);

// Get meeting chat history
router.get('/chat/:meetingId', getChatHistory);

module.exports = router; 