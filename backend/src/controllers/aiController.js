const aiService = require('../services/aiService');
const ocrService = require('../services/ocrService');
const ttsService = require('../services/ttsService');
const Message = require('../models/Message');
const Meeting = require('../models/Meeting');

// Simple chat endpoint for frontend (no auth required)
const chat = async (req, res) => {
  try {
    const { message, meetingId, userId, hasScreenShare } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Create context based on screen sharing
    let context = '';
    if (hasScreenShare) {
      context = 'User is sharing their screen. Provide contextual help based on what they might be working on.';
    }

    // Get AI response
    const aiResponse = await aiService.processQuery(message, context);

    if (!aiResponse.success) {
      return res.status(500).json({ error: aiResponse.error });
    }

    res.json({
      success: true,
      response: aiResponse.response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
};

// Process user query and get AI response
const processQuery = async (req, res) => {
  try {
    const { meetingId, query, screenData } = req.body;
    const { userId } = req.user;

    // Find the meeting
    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    let context = '';
    
    // If screen data is provided, extract text using OCR
    if (screenData) {
      try {
        const ocrResult = await ocrService.extractText(screenData);
        context = ocrResult.text;
      } catch (ocrError) {
        console.error('OCR Error:', ocrError);
        // Continue without OCR context
      }
    }

    // Get AI response
    const aiResponse = await aiService.processQuery(query, context);

    if (!aiResponse.success) {
      return res.status(500).json({ error: aiResponse.error });
    }

    // Save user message
    const userMessage = new Message({
      meetingId: meeting._id,
      sender: userId,
      senderType: 'user',
      content: query,
      messageType: 'text',
      metadata: {
        screenData: screenData || null,
        context: context || null,
      },
    });
    await userMessage.save();

    // Save AI response
    const aiMessage = new Message({
      meetingId: meeting._id,
      senderType: 'ai',
      content: aiResponse.response,
      messageType: 'text',
      metadata: {
        context: context || null,
      },
    });
    await aiMessage.save();

    // Generate voice if enabled
    let voiceUrl = null;
    if (meeting.settings.aiVoiceEnabled) {
      try {
        const ttsResult = await ttsService.generateSpeech(aiResponse.response);
        voiceUrl = ttsResult.audioUrl;
        
        // Update AI message with voice URL
        aiMessage.metadata.voiceUrl = voiceUrl;
        aiMessage.messageType = 'voice';
        await aiMessage.save();
      } catch (ttsError) {
        console.error('TTS Error:', ttsError);
        // Continue without voice
      }
    }

    res.json({
      success: true,
      response: {
        text: aiResponse.response,
        voiceUrl: voiceUrl,
        context: context,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Process query error:', error);
    res.status(500).json({ error: 'Failed to process query' });
  }
};

// Analyze screen content
const analyzeScreen = async (req, res) => {
  try {
    const { imageData, meetingId, userId } = req.body;

    if (!imageData) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    console.log('Screen analysis requested for meeting:', meetingId);

    // Extract text from screen using OCR
    let ocrText = '';
    try {
      const ocrResult = await ocrService.extractText(imageData);
      ocrText = ocrResult.text;
      console.log('OCR extracted text:', ocrText.substring(0, 100) + '...');
    } catch (ocrError) {
      console.error('OCR Error:', ocrError);
      ocrText = 'Unable to extract text from screen';
    }
    
    // Analyze with AI
    const analysis = await aiService.analyzeScreenContent(ocrText);

    if (!analysis.success) {
      return res.status(500).json({ error: analysis.error });
    }

    console.log('Screen analysis completed successfully');

    res.json({
      success: true,
      analysis: analysis.analysis,
      ocrText: ocrText,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analyze screen error:', error);
    res.status(500).json({ error: 'Failed to analyze screen' });
  }
};

// Get meeting chat history
const getChatHistory = async (req, res) => {
  try {
    const { meetingId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }

    const messages = await Message.find({ meetingId: meeting._id })
      .populate('sender', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    res.json({
      success: true,
      messages: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Message.countDocuments({ meetingId: meeting._id }),
      },
    });
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: 'Failed to get chat history' });
  }
};

// Chat with screenshot endpoint for frontend (no auth required)
const chatWithScreenshot = async (req, res) => {
  try {
    console.log('[chatWithScreenshot] Controller called');
    console.log('[chatWithScreenshot] Incoming req.body keys:', Object.keys(req.body));
    console.log('[chatWithScreenshot] req.body.message:', req.body.message);
    console.log('[chatWithScreenshot] req.body.message type:', typeof req.body.message);
    console.log('[chatWithScreenshot] Headers:', req.headers);
    
    const { message, screenSnapshot, meetingId, userId, hasScreenShare } = req.body;

    // More detailed validation with better error messages
    if (!message) {
      console.log('[chatWithScreenshot] Error: message is missing');
      return res.status(400).json({ error: 'Message field is required' });
    }
    
    if (typeof message !== 'string') {
      console.log('[chatWithScreenshot] Error: message is not a string');
      return res.status(400).json({ error: 'Message must be a string' });
    }
    
    if (message.trim() === '') {
      console.log('[chatWithScreenshot] Error: message is empty');
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    let context = '';
    let ocrText = '';

    // If screen snapshot is provided and not empty, run OCR
    if (screenSnapshot && screenSnapshot.trim() !== '' && hasScreenShare) {
      try {
        console.log('[chatWithScreenshot] Running OCR on screen snapshot...');
        const Tesseract = require('tesseract.js');
        const result = await Tesseract.recognize(screenSnapshot, 'eng');
        ocrText = result.data.text;
        console.log('[chatWithScreenshot] OCR extracted text:', ocrText.substring(0, 100) + '...');
        
        // Create context from OCR text
        context = `Screen content: ${ocrText}\n\nUser question: ${message}`;
      } catch (ocrError) {
        console.error('[chatWithScreenshot] OCR Error:', ocrError);
        context = `User question: ${message}`;
      }
    } else {
      console.log('[chatWithScreenshot] No screen snapshot provided or screen sharing not active');
      context = `User question: ${message}`;
    }

    // Get AI response with context
    console.log('[chatWithScreenshot] Getting AI response with context...');
    const aiResponse = await aiService.processQuery(message, context);

    if (!aiResponse.success) {
      console.error('[chatWithScreenshot] AI response failed:', aiResponse.error);
      return res.status(500).json({ error: aiResponse.error });
    }

    console.log('[chatWithScreenshot] AI response received:', aiResponse.response.substring(0, 100) + '...');

    res.json({
      success: true,
      response: aiResponse.response,
      ocrText: ocrText,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat with screenshot error:', error);
    res.status(500).json({ error: 'Failed to process chat message with screenshot' });
  }
};

module.exports = {
  chat,
  processQuery,
  analyzeScreen,
  getChatHistory,
  chatWithScreenshot,
}; 