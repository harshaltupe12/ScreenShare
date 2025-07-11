# AI Services Setup Guide

This guide will help you set up all the AI services used in the jerry application.

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database (Optional for development)
MONGODB_URI=your_mongodb_uri_here

# AI Services
GEMINI_API_KEY=your_gemini_api_key_here
HUGGING_FACE_API_KEY=your_hugging_face_api_key_here

# Text-to-Speech Services (Optional - using browser TTS by default)
# ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Google Cloud TTS (Optional)
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/google-credentials.json
```

## AI Service Setup

### 1. Google Gemini AI (Recommended)

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env` file as `GEMINI_API_KEY`

**Features:**
- Free tier available
- High-quality responses
- Good context understanding
- Fast response times

### 2. Hugging Face (Alternative)

1. Go to [Hugging Face](https://huggingface.co/settings/tokens)
2. Create a new access token
3. Add it to your `.env` file as `HUGGING_FACE_API_KEY`

**Features:**
- Free tier available
- Multiple model options
- Good for specific tasks

### 3. Browser TTS (Built-in)

The application uses `react-speech-kit` which leverages the browser's built-in speech synthesis API.

**Features:**
- No API key required
- Works offline
- Multiple voice options available
- Cross-browser compatibility
- No rate limits or costs

### 4. Google Cloud TTS (Alternative)

1. Set up a Google Cloud project
2. Enable the Text-to-Speech API
3. Create a service account and download credentials
4. Add the path to your `.env` file as `GOOGLE_APPLICATION_CREDENTIALS`

## Installation

1. Install backend dependencies:
```bash
cd backend
npm install
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Access the application at `http://localhost:3000`

## Workflow Overview

The complete AI workflow is now implemented:

1. **User shares screen** via WebRTC
2. **Frontend captures screen snapshot** using canvas
3. **Sends image via WebSocket** to backend
4. **Backend performs OCR** using Tesseract.js
5. **Extracted text sent to Gemini AI** for analysis
6. **Gemini gives intelligent suggestions** based on screen content
7. **Backend sends AI response** (text only)
8. **Frontend generates voice** using react-speech-kit
9. **Frontend shows chat + plays voice** using browser TTS

## Features

### ✅ Implemented Features

- **Real-time Screen Sharing**: WebRTC with getDisplayMedia()
- **Screen Capture**: Canvas-based snapshot capture with compression
- **WebSocket Communication**: Socket.IO for real-time messaging
- **OCR Processing**: Tesseract.js for text extraction
- **AI Integration**: Multiple AI providers with fallback
- **Voice Synthesis**: Browser TTS using react-speech-kit
- **Voice Playback**: Built-in browser speech synthesis
- **Speech Recognition**: Voice input for questions
- **Real-time Chat**: Live messaging with AI assistant
- **Connection Status**: WebSocket connection monitoring
- **Error Handling**: Comprehensive error handling and fallbacks

### 🔧 Configuration Options

- **AI Provider Selection**: Automatic fallback between Gemini, Hugging Face, and local responses
- **Voice Provider Selection**: Browser TTS using react-speech-kit
- **Image Compression**: Automatic compression to reduce bandwidth
- **Connection Retry**: Automatic WebSocket reconnection
- **Voice Toggle**: Enable/disable AI voice responses

## Troubleshooting

### Common Issues

1. **Screen Sharing Not Working**
   - Ensure you're using HTTPS or localhost
   - Check browser permissions
   - Try refreshing the page

2. **AI Responses Not Working**
   - Check API keys in `.env` file
   - Verify internet connection
   - Check browser console for errors

3. **Voice Not Playing**
   - Ensure audio is not muted
   - Check browser permissions for speech synthesis
   - Try refreshing the page

4. **WebSocket Connection Issues**
   - Check backend server is running
   - Verify CORS settings
   - Check firewall settings

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=true
```

This will show detailed logs for:
- WebSocket connections
- AI API calls
- OCR processing
- TTS generation

## Performance Optimization

### Image Compression
- Automatic compression to 1280x720 max resolution
- JPEG quality set to 70%
- Further compression available via WebSocket service

### AI Response Caching
- Responses are cached to reduce API calls
- Context is preserved for better responses
- Fallback responses ensure availability

### Voice Optimization
- Browser TTS is instant and requires no transmission
- No audio file generation or storage needed
- Built-in voice selection and customization

## Security Considerations

- API keys are stored in environment variables
- No sensitive data is logged
- WebSocket connections are validated
- Input sanitization is implemented
- CORS is properly configured

## Future Enhancements

- **Multi-language Support**: Add support for multiple languages
- **Custom Voices**: Allow users to select different AI voices
- **Meeting Recording**: Record meetings with AI transcriptions
- **Advanced Analytics**: Track AI usage and performance
- **Plugin System**: Allow custom AI integrations 