# AI Services Setup Guide

This guide will help you set up all the AI services and authentication used in the jerry application.

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database (Optional for development)
MONGODB_URI=your_mongodb_uri_here

# Authentication (Required for production)
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_in_production

# AI Services
GEMINI_API_KEY=your_gemini_api_key_here
HUGGING_FACE_API_KEY=your_hugging_face_api_key_here

# Text-to-Speech Services (Optional - using browser TTS by default)
# ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Google Cloud TTS (Optional)
GOOGLE_APPLICATION_CREDENTIALS=path/to/your/google-credentials.json
```

## Authentication Setup

### JWT Configuration

The application now uses JWT (JSON Web Tokens) for secure authentication:

1. **Generate secure JWT secrets**:
   ```bash
   # Generate a random 32-character string for JWT_SECRET
   openssl rand -hex 32
   
   # Generate a random 32-character string for JWT_REFRESH_SECRET
   openssl rand -hex 32
   ```

2. **Add the secrets to your `.env` file**:
   ```env
   JWT_SECRET=your_generated_jwt_secret_here
   JWT_REFRESH_SECRET=your_generated_refresh_secret_here
   ```

**Security Notes:**
- Never commit these secrets to version control
- Use different secrets for development and production
- Rotate secrets regularly in production
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days

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

## Authentication Features

### ✅ Implemented Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds of 12
- **Account Locking**: Automatic lockout after 5 failed attempts
- **Token Refresh**: Automatic token refresh before expiry
- **User Registration**: Complete user registration with validation
- **User Login**: Secure login with error handling
- **Profile Management**: Update profile information
- **Password Change**: Secure password change functionality
- **Session Management**: Proper session handling and cleanup

### 🔧 Security Features

- **Password Validation**: Minimum 6 characters required
- **Email Validation**: Proper email format validation
- **Account Security**: Login attempt tracking and lockout
- **Token Security**: Short-lived access tokens (15 minutes)
- **Refresh Tokens**: Long-lived refresh tokens (7 days)
- **Input Sanitization**: Proper input validation and sanitization
- **Error Handling**: Secure error messages without information leakage

## Workflow Overview

The complete authentication workflow:

1. **User registers/logs in** via secure forms
2. **Backend validates credentials** and hashes passwords
3. **JWT tokens generated** (access + refresh)
4. **Frontend stores tokens** securely in localStorage
5. **Automatic token refresh** before expiry
6. **Protected routes** require valid tokens
7. **User profile management** with secure updates
8. **Secure logout** with token cleanup

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
- **JWT Authentication**: Secure token-based authentication
- **User Management**: Complete user registration and profile management

### 🔧 Configuration Options

- **AI Provider Selection**: Automatic fallback between Gemini, Hugging Face, and local responses
- **Voice Provider Selection**: Browser TTS using react-speech-kit
- **Image Compression**: Automatic compression to reduce bandwidth
- **Connection Retry**: Automatic WebSocket reconnection
- **Voice Toggle**: Enable/disable AI voice responses
- **Authentication**: Configurable JWT secrets and token expiry

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check JWT secrets in `.env` file
   - Ensure MongoDB is running (for user storage)
   - Verify token expiry settings
   - Check browser console for errors

2. **Screen Sharing Not Working**
   - Ensure you're using HTTPS or localhost
   - Check browser permissions
   - Try refreshing the page

3. **AI Responses Not Working**
   - Check API keys in `.env` file
   - Verify internet connection
   - Check browser console for errors

4. **Voice Not Playing**
   - Ensure audio is not muted
   - Check browser permissions for speech synthesis
   - Try refreshing the page

5. **WebSocket Connection Issues**
   - Check backend server is running
   - Verify CORS settings
   - Check firewall settings

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=true
```

This will show detailed logs for:
- Authentication events
- JWT token operations
- WebSocket connections
- AI API calls
- OCR processing
- TTS generation

## Performance Optimization

### Authentication Optimization
- JWT tokens for stateless authentication
- Automatic token refresh to maintain sessions
- Efficient password hashing with bcrypt
- Minimal database queries for authentication

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

- **JWT Secrets**: Stored in environment variables, never in code
- **Password Security**: bcrypt hashing with salt rounds of 12
- **Token Security**: Short-lived access tokens, secure refresh tokens
- **Input Validation**: Comprehensive input sanitization
- **Error Handling**: Secure error messages without information leakage
- **Session Management**: Proper token cleanup on logout
- **Account Protection**: Automatic lockout after failed attempts
- **CORS Configuration**: Proper CORS settings for security
- **API Security**: All sensitive endpoints require authentication

## Production Deployment

### Environment Variables for Production

```env
# Production settings
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-domain.com

# Database (Required for production)
MONGODB_URI=mongodb://your-production-mongodb-uri

# Authentication (Required for production)
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret

# AI Services
GEMINI_API_KEY=your_gemini_api_key
HUGGING_FACE_API_KEY=your_hugging_face_api_key
```

### Security Checklist

- [ ] Use strong JWT secrets (32+ characters)
- [ ] Enable HTTPS in production
- [ ] Set up proper CORS configuration
- [ ] Configure MongoDB with authentication
- [ ] Set up proper logging and monitoring
- [ ] Regular security updates
- [ ] Backup strategy for user data
- [ ] Rate limiting for API endpoints 