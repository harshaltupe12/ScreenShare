# Jerry - AI-Powered Meeting Assistant

A real-time meeting platform with AI assistance, screen sharing, and voice synthesis capabilities.

## Features

### 🖥️ Real-Time Screen Sharing
- **Live Screen Sharing**: Share your screen with other participants in real-time
- **Cross-Platform**: Works on desktop browsers with screen sharing permissions
- **Visual Indicators**: See who is currently sharing their screen
- **Automatic Updates**: Screen updates every 500ms for smooth experience
- **Participant Status**: View who is sharing in the participants list
- **Image Compression**: Automatic compression for optimal performance

### 🤖 AI Assistant
- **Context-Aware**: AI can see and analyze your shared screen using OCR
- **Real-Time Responses**: Get instant AI assistance during meetings
- **Multiple AI Providers**: Gemini AI, Hugging Face, and intelligent fallbacks
- **Voice Synthesis**: Browser TTS using react-speech-kit
- **Voice Playback**: Audio responses with error handling
- **Speech Recognition**: Voice input for questions
- **Meeting History**: All conversations are saved and accessible

### 👥 Meeting Management
- **Real-Time Participants**: See who joins and leaves the meeting
- **WebSocket Communication**: Instant updates across all participants
- **Meeting Rooms**: Create and join meeting rooms with unique IDs
- **User Authentication**: Secure access with Clerk authentication
- **Connection Status**: Real-time WebSocket connection monitoring

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Modern browser with screen sharing support

### Installation

1. **Clone the repository**
```bash
   git clone <repository-url>
   cd jerry
   ```

2. **Install dependencies**
```bash
   # Backend
cd backend
npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Backend (.env)
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   MONGODB_URI=your_mongodb_uri
   
   # AI Services (optional but recommended)
   GEMINI_API_KEY=your_gemini_api_key
   HUGGING_FACE_API_KEY=your_hugging_face_api_key
   
   # Frontend (.env.local)
   NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
   ```
   
   **💡 Tip**: See `backend/AI_SETUP.md` for detailed setup instructions for AI services.
```

4. **Start the servers**
   ```bash
   # Backend (Terminal 1)
   cd backend
   npm start
   
   # Frontend (Terminal 2)
   cd frontend
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## Usage

### Screen Sharing
1. **Join a meeting room**
2. **Click "Share Screen"** in the meeting controls
3. **Select your screen/window** when prompted
4. **Other participants will see your screen** in real-time
5. **Click "Stop Sharing"** to end screen sharing

### AI Assistant
1. **Share your screen** (optional but recommended)
2. **Type your question** in the AI chat or use voice input
3. **AI will analyze your screen** using OCR and provide contextual responses
4. **Enable voice synthesis** to hear AI responses with browser TTS
5. **View extracted text** from your screen for better context

### Meeting Features
- **Real-time participant list** with online status
- **Screen sharing indicators** showing who is currently sharing
- **Instant messaging** with AI assistant
- **Meeting history** preservation

## Technical Details

### Architecture
- **Frontend**: Next.js 14 with TypeScript
- **Backend**: Node.js with Express and Socket.IO
- **Real-time**: WebSocket communication for instant updates
- **Authentication**: Clerk for secure user management
- **Database**: MongoDB for data persistence

### Screen Sharing Implementation
- **MediaDevices API**: Uses `getDisplayMedia()` for screen capture
- **Canvas Capture**: Converts video frames to base64 images with compression
- **WebSocket Broadcasting**: Sends screen data to all participants
- **Real-time Updates**: 500ms refresh rate for smooth experience
- **Image Optimization**: Automatic compression to 1280x720 max resolution

### Security
- **HTTPS Required**: Screen sharing requires secure context
- **User Authentication**: All users must be authenticated
- **Meeting Access Control**: Secure meeting room access
- **Data Privacy**: Screen data is not stored permanently

## Browser Support

### Screen Sharing Support
- ✅ Chrome/Chromium (v72+)
- ✅ Firefox (v66+)
- ✅ Safari (v13+)
- ✅ Edge (v79+)

### Required Permissions
- Screen sharing permission
- Microphone (for voice features)
- Camera (optional)

## Development

### Project Structure
```
jerry/
├── backend/          # Node.js server
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   └── models/
│   └── index.js      # Main server file
├── frontend/         # Next.js application
│   ├── app/          # App router pages
│   ├── components/   # React components
│   └── lib/          # Utility functions
└── README.md
```

### Key Components
- **ScreenShare.tsx**: Handles screen capture and display
- **MeetingRoom**: Main meeting interface with complete workflow
- **WebSocket Service**: Enhanced real-time communication with callbacks
- **AI Service**: Multi-provider AI integration with fallbacks
- **TTS Service**: Browser TTS using react-speech-kit
- **OCR Service**: Tesseract.js text extraction

## Testing

### Test the Complete Workflow

1. **Run the test script** to verify all components:
   ```bash
   cd backend
   node test-workflow.js
   ```

2. **Manual Testing**:
   - Start both servers (backend and frontend)
   - Join a meeting room
   - Share your screen
   - Ask the AI a question
   - Verify voice responses work
   - Test voice input functionality

### Expected Workflow

1. **User shares screen** via WebRTC ➜
2. **Frontend captures screen snapshot** ➜
3. **Sends image via WebSocket** ➜
4. **Backend performs OCR** (Tesseract) ➜
5. **Extracted text sent to Gemini AI** ➜
6. **Gemini gives intelligent suggestions** ➜
7. **Backend generates voice** (ElevenLabs) ➜
8. **Sends AI response (text + audio)** ➜
9. **Frontend shows chat + plays voice**

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly using the test script
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository. 