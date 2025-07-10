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

// All other routes require authentication
router.use(auth);

// Process user query and get AI response
router.post('/query', processQuery);

// Analyze screen content
router.post('/analyze-screen', analyzeScreen);

// Get meeting chat history
router.get('/chat/:meetingId', getChatHistory);

module.exports = router; 