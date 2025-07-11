// AI Configuration - Free Alternatives
// This file contains configuration for free AI services

const aiConfig = {
  // Google Gemini API (Free tier available)
  gemini: {
    enabled: true,
    apiKey: process.env.GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    instructions: `
      To get a free Gemini API key:
      1. Go to https://makersuite.google.com/app/apikey
      2. Sign in with your Google account
      3. Click "Create API Key"
      4. Copy the key and add it to your .env file as GEMINI_API_KEY=your_key_here
    `
  },

  // Hugging Face API (Free tier available)
  huggingFace: {
    enabled: true,
    apiKey: process.env.HUGGING_FACE_API_KEY || null, // Optional for some models
    baseUrl: 'https://api-inference.huggingface.co',
    instructions: `
      To get a free Hugging Face API key (optional but recommended):
      1. Go to https://huggingface.co/settings/tokens
      2. Sign up or sign in
      3. Click "New token"
      4. Give it a name and select "Read" role
      5. Copy the key and add it to your .env file as HUGGING_FACE_API_KEY=your_key_here
    `
  },

  // Local AI fallback (always available)
  localAI: {
    enabled: true,
    instructions: `
      Local AI provides intelligent responses without external APIs.
      It's always available as a fallback when other services are unavailable.
    `
  },

  // Response settings
  settings: {
    maxRetries: 3,
    timeout: 10000, // 10 seconds
    maxTokens: 500,
    temperature: 0.7
  }
};

module.exports = aiConfig; 