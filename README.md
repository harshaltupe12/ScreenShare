# Jerry - AI-Powered Meeting Assistant

A real-time meeting platform with AI assistance, screen sharing, and voice synthesis capabilities.

## Features

### 🖥️ Real-Time Screen Sharing
- **Live Screen Sharing**: Share your screen with other participants in real-time
- **Cross-Platform**: Works on desktop browsers with screen sharing permissions
- **Visual Indicators**: See who is currently sharing their screen
- **Automatic Updates**: Screen updates every 500ms for smooth experience
- **Participant Status**: View who is sharing in the participants list

### 🤖 AI Assistant
- **Context-Aware**: AI can see and analyze your shared screen
- **Real-Time Responses**: Get instant AI assistance during meetings
- **Voice Synthesis**: AI responses can be converted to speech
- **Meeting History**: All conversations are saved and accessible

### 👥 Meeting Management
- **Real-Time Participants**: See who joins and leaves the meeting
- **WebSocket Communication**: Instant updates across all participants
- **Meeting Rooms**: Create and join meeting rooms with unique IDs
- **User Authentication**: Secure access with Clerk authentication

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
   
   # Frontend (.env.local)
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
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
2. **Type your question** in the AI chat
3. **AI will analyze your screen** and provide contextual responses
4. **Enable voice synthesis** to hear AI responses

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
- **Canvas Capture**: Converts video frames to base64 images
- **WebSocket Broadcasting**: Sends screen data to all participants
- **Real-time Updates**: 500ms refresh rate for smooth experience

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
- **MeetingRoom**: Main meeting interface
- **WebSocket Service**: Real-time communication
- **AI Service**: AI integration and processing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository. 