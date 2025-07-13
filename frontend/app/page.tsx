import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#121010] to-[#080707]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-16">
          <h1 className="text-4xl md:text-7xl font-bold text-white mb-6">
            Welcome to {" "}
            <span className="bg-gradient-to-r from-orange-500 via-pink-500  to-red-800 bg-clip-text text-transparent">
              ScreenShare.AI
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Your personal AI assistant with screen sharing capabilities. Get instant help with any task, 
            powered by intelligent AI that can see and understand your screen.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/ai-assistant"
              className="bg-[#120d0d] border border-white/60 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#1a1515] transition-colors"
            >
              Try AI Assistant
            </Link>
            <Link
              href="/dashboard"
              className="bg-white text-gray-900 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-white hover:bg-gray-100 transition-colors"
            >
              View Dashboard
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              AI-Powered Screen Assistance
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Share your screen and get instant AI help with coding, design, troubleshooting, and more.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Screen Sharing */}
            <div className="bg-black rounded-lg shadow-lg p-6 border border-white/60">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-gradient-to-b from-purple-500 to-fuchsia-500">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Screen Sharing</h3>
              <p className="text-gray-300">
                Share your screen securely and let AI analyze what you're working on in real-time.
              </p>
            </div>

            {/* AI Assistant */}
            <div className="bg-black rounded-lg shadow-lg p-6 border border-white/60">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-gradient-to-br from-orange-400 via-yellow-500 to-red-500">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Assistant</h3>
              <p className="text-gray-300">
                Get instant AI responses to your questions with context-aware assistance.
              </p>
            </div>

            {/* Voice Features */}
            <div className="bg-black rounded-lg shadow-lg p-6 border border-white/60">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-gradient-to-r from-red-500 to-pink-500">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Voice Features</h3>
              <p className="text-gray-300">
                Use voice input for questions and hear AI responses with text-to-speech.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="py-16 bg-black rounded-lg shadow-lg border border-white/60">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Simple steps to get AI assistance for any task
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto px-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-gradient-to-r from-red-500 to-pink-500">
                <span className="text-white font-bold">1</span>
              </div>
              <h3 className="font-semibold text-white mb-2">Sign In</h3>
              <p className="text-sm text-gray-300">Create an account or sign in securely</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-gradient-to-b from-purple-500 to-fuchsia-500">
                <span className="text-white font-bold">2</span>
              </div>
              <h3 className="font-semibold text-white mb-2">Start AI Assistant</h3>
              <p className="text-sm text-gray-300">Click to begin your AI session</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-orange-400 via-yellow-500 to-red-500">
                <span className="text-white font-bold">3</span>
              </div>
              <h3 className="font-semibold text-white mb-2">Share Screen</h3>
              <p className="text-sm text-gray-300">Share your screen for AI analysis</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 bg-gradient-to-l from-pink-500 via-orange-400 to-red-500">
                <span className="text-white font-bold">4</span>
              </div>
              <h3 className="font-semibold text-white mb-2">Get Help</h3>
              <p className="text-sm text-gray-300">Ask questions and get AI assistance</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Join thousands of users getting AI assistance for their daily tasks
          </p>
          <Link
            href="/ai-assistant"
            className="bg-[#120d0d] border border-white/60 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#1a1515] transition-colors"
          >
            Start Using ScreenShare.AI Today
          </Link>
        </div>
      </div>
    </div>
  );
}
