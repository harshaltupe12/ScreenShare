"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Only run on client
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('jerry_user');
      if (userData) {
        const user = JSON.parse(userData);
        if (user.isAuthenticated) {
          setUser(user);
        } else {
          router.push('/auth/simple');
        }
      } else {
        router.push('/auth/simple');
      }
      setIsLoading(false);
    }
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem('jerry_user');
    router.push('/auth/simple');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <Link 
            href="/auth/simple" 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome to jerry, {user.name}!
            </h1>
            <p className="text-gray-600">
              Your personal AI assistant with screen sharing capabilities
            </p>
            <button
              onClick={handleSignOut}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700"
            >
              Sign Out
            </button>
          </div>

          <div className="max-w-2xl mx-auto">
            {/* Start AI Assistant */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Start AI Assistant
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Begin your AI-powered screen sharing and chat session
                  </p>
                  <Link
                    href="/ai-assistant"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Start AI Assistant
                  </Link>
                </div>
              </div>
            </div>

            {/* Features Info */}
            <div className="mt-8 bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Features
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Screen sharing with AI analysis</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Real-time AI chat assistance</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Voice synthesis for AI responses</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600">Context-aware AI assistance</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 