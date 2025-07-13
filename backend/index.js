require('dotenv').config();
console.log('DEBUG MONGODB_URI:', process.env.MONGODB_URI);




const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const connectDB = require('./src/config/database');
const Tesseract = require('tesseract.js');

// Import routes
const meetingRoutes = require('./src/routes/meetings');
const aiRoutes = require('./src/routes/ai');
const authRoutes = require('./src/routes/auth');
const aiSessionRoutes = require('./src/routes/aiSession');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Initialize server
const startServer = async () => {
  try {
    // Connect to MongoDB (optional for development)
    const dbConnected = await connectDB();
    
    // Middleware
    app.use(express.json({ limit: '100mb' }));
    app.use(express.urlencoded({ extended: true, limit: '100mb' }));
    app.use(cors());

    // Basic route
    app.get('/', (req, res) => {
      res.json({ 
        message: 'jerry backend is running!',
        version: '1.0.0',
        features: ['WebSocket', 'AI Integration', 'Screen Sharing', 'Voice Synthesis', 'Database'],
        database: dbConnected ? 'Connected' : 'Not connected (development mode)'
      });
    });

    // Health check endpoint
    app.get('/api/health', (req, res) => {
      res.json({ 
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: dbConnected ? 'Connected' : 'Not connected'
      });
    });

    // Debug route to test body parsing
    app.post('/api/test-body', (req, res) => {
      console.log('[TEST] req.headers:', req.headers);
      let rawBody = '';
      req.on('data', chunk => { rawBody += chunk; });
      req.on('end', () => {
        console.log('[TEST] raw body length:', rawBody.length);
        console.log('[TEST] raw body preview:', rawBody.substring(0, 200));
        console.log('[TEST] req.body:', req.body);
        console.log('[TEST] req.body.message:', req.body.message);
        console.log('[TEST] req.body.message type:', typeof req.body.message);
        res.json({ 
          received: req.body,
          message: req.body.message,
          messageType: typeof req.body.message,
          bodyKeys: Object.keys(req.body)
        });
      });
    });

    // API Routes
    app.use('/api/auth', authRoutes);
    app.use('/api/meetings', meetingRoutes);
    app.use('/api/ai', aiRoutes);
    app.use('/api/ai-sessions', aiSessionRoutes);

    // WebSocket connection handling
    io.on('connection', (socket) => {
      console.log('User connected:', socket.id);

      socket.on('join-meeting', async (data) => {
        const { meetingId, userId, userName } = data;
        socket.join(meetingId);
        console.log(`User ${userName} (${userId}) joined meeting ${meetingId}`);
        
        // Notify others in the meeting
        socket.to(meetingId).emit('user-joined', { 
          userId, 
          userName,
          socketId: socket.id,
          timestamp: new Date().toISOString()
        });
      });

      socket.on('send-screen-data', async (data) => {
        const { meetingId, imageData, userId, userName } = data;
        console.log(`Screen data received from user ${userName} in meeting ${meetingId}`);
        
        // Broadcast to other users in the meeting
        socket.to(meetingId).emit('screen-data-updated', { 
          userId,
          userName,
          imageData,
          timestamp: new Date().toISOString()
        });
      });

      socket.on('screen-share-start', async (data) => {
        const { meetingId, userId, userName } = data;
        console.log(`Screen sharing started by user ${userName} in meeting ${meetingId}`);
        
        // Broadcast to other users in the meeting
        socket.to(meetingId).emit('screen-share-started', { 
          userId,
          userName,
          timestamp: new Date().toISOString()
        });
      });

      socket.on('screen-share-stop', async (data) => {
        const { meetingId, userId, userName } = data;
        console.log(`Screen sharing stopped by user ${userName} in meeting ${meetingId}`);
        
        // Broadcast to other users in the meeting
        socket.to(meetingId).emit('screen-share-stopped', { 
          userId,
          userName,
          timestamp: new Date().toISOString()
        });
      });

      socket.on('send-query', async (data) => {
        const { meetingId, query, userId, userName } = data;
        console.log(`Query received: ${query} from user ${userName}`);
        
        // Broadcast query to all users in meeting
        io.to(meetingId).emit('query-received', {
          userId,
          userName,
          query,
          timestamp: new Date().toISOString()
        });
      });

      socket.on('ai-response', async (data) => {
        const { meetingId, response, voiceUrl, userId } = data;
        console.log(`AI response sent to meeting ${meetingId}`);
        
        // Broadcast AI response to all users in meeting
        io.to(meetingId).emit('ai-response-received', {
          response,
          voiceUrl,
          timestamp: new Date().toISOString()
        });
      });

      socket.on('leave-meeting', (data) => {
        const { meetingId, userId, userName } = data;
        socket.leave(meetingId);
        console.log(`User ${userName} left meeting ${meetingId}`);
        
        // Notify others in the meeting
        socket.to(meetingId).emit('user-left', { 
          userId, 
          userName,
          timestamp: new Date().toISOString()
        });
      });

      socket.on('send-screen-snapshot', async (data) => {
        const { sessionId, imageData, userId, userName } = data;
        console.log(`Screen snapshot received from ${userName} (${userId}) in session ${sessionId}`);
        try {
          // Run OCR using Tesseract
          const result = await Tesseract.recognize(imageData, 'eng');
          const extractedText = result.data.text;
          console.log('Extracted OCR text:', extractedText);

          // TODO: Send extractedText to Gemini AI and get response
          // For now, just echo the OCR text as the AI response
          const aiResponse = `Extracted text from your screen: ${extractedText}`;
          // TODO: Optionally generate voice/audio
          const voiceUrl = null;

          // Emit AI response event back to the client
          socket.emit('ai-response-received', {
            response: aiResponse,
            voiceUrl,
            timestamp: new Date().toISOString(),
          });
        } catch (err) {
          console.error('OCR or AI error:', err);
          socket.emit('ai-response-received', {
            response: 'Sorry, I could not process your screen snapshot.',
            voiceUrl: null,
            timestamp: new Date().toISOString(),
          });
        }
      });

      socket.on('send-message-with-screenshot', async (data) => {
        const { message, screenSnapshot, meetingId, userId, userName, hasScreenShare, sessionId } = data;
        console.log('[WebSocket] Message with screenshot received:', { userName, userId, meetingId, hasScreenShare, sessionId });
        console.log('[WebSocket] Message:', message);
        
        try {
          let context = '';
          let ocrText = '';

          // If screen snapshot is provided, run OCR
          if (screenSnapshot && hasScreenShare) {
            try {
              const result = await Tesseract.recognize(screenSnapshot, 'eng');
              ocrText = result.data.text;
              console.log('[WebSocket] OCR extracted text:', ocrText.substring(0, 100) + '...');
              
              // Create context from OCR text and user message
              context = `Screen content: ${ocrText}\n\nUser question: ${message}`;
            } catch (ocrError) {
              console.error('[WebSocket] OCR Error:', ocrError);
              context = `User question: ${message}`;
            }
          } else {
            context = `User question: ${message}`;
          }

          // Get AI response with context and session history
          const aiService = require('./src/services/aiService');
          const aiResponse = await aiService.processQuery(message, context, sessionId, userId);

          if (!aiResponse.success) {
            throw new Error(aiResponse.error);
          }

          // Print the AI answer to the console
          console.log('[WebSocket] AI Answer:', aiResponse.response);

          // Save messages to session if sessionId is provided
          if (sessionId && userId) {
            try {
              const AISessionService = require('./src/services/aiSessionService');
              
              // Save user message
              await AISessionService.saveMessage(sessionId, userId, {
                senderType: 'user',
                content: message,
                messageType: 'text',
                metadata: {
                  screenSnapshot: screenSnapshot || null,
                  context: context || null,
                  ocrText: ocrText || null,
                }
              });

              // Save AI response
              await AISessionService.saveMessage(sessionId, userId, {
                senderType: 'ai',
                content: aiResponse.response,
                messageType: 'text',
                metadata: {
                  context: context || null,
                  ocrText: ocrText || null,
                }
              });

              console.log('[WebSocket] Messages saved to session:', sessionId);
            } catch (saveError) {
              console.error('[WebSocket] Error saving messages to session:', saveError);
              // Continue without saving - don't fail the request
            }
          }

          // Emit AI response event back to the client
          // Voice will be handled by react-speech-kit on the frontend
          console.log('[WebSocket] Emitting ai-response:', aiResponse.response);
          socket.emit('ai-response', {
            response: aiResponse.response,
            ocrText: ocrText,
            timestamp: new Date().toISOString(),
          });
        } catch (err) {
          console.error('[WebSocket] AI processing error:', err);
          if (err && err.message) {
            console.error('[WebSocket] AI Error Message:', err.message);
          }
          socket.emit('ai-response', {
            response: 'Sorry, I could not process your request. Please try again.',
            ocrText: '',
            timestamp: new Date().toISOString(),
          });
        }
      });

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
      });
    });

    server.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
      console.log(`WebSocket server ready for connections`);
      if (dbConnected) {
        console.log(`Database connected successfully`);
      } else {
        console.log(`Running without database connection (development mode)`);
      }
    });
    
  } catch (error) {
    console.error('Server startup error:', error);
    process.exit(1);
  }
};

// Start the server
startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
}); 