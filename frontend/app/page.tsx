import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-20">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">jerry</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Your personal AI assistant with screen sharing capabilities. Get instant help with any task, 
            powered by intelligent AI that can see and understand your screen.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/simple"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/simple"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose jerry?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-blue-600 text-xl">🖥️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Screen Sharing</h3>
              <p className="text-gray-600">
                Share your screen with AI and get contextual assistance for any application or task you're working on.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-green-600 text-xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Assistant</h3>
              <p className="text-gray-600">
                Get intelligent responses via text and voice from our advanced AI powered by GPT-3.5.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-purple-600 text-xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Context-Aware Help</h3>
              <p className="text-gray-600">
                AI understands what's on your screen and provides relevant assistance with OCR text recognition.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
