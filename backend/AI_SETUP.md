# AI Service Setup Guide

This guide will help you get free API keys for real AI responses instead of dummy replies.

## 🚀 Quick Setup

### 1. Google Gemini API (Recommended - Free Tier)
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key
5. Add to your `.env` file: `GEMINI_API_KEY=your_key_here`

**Free Tier Limits:**
- 15 requests per minute
- 1,500 requests per day
- No credit card required

### 2. Hugging Face API (Optional - Free Tier)
1. Go to [Hugging Face Tokens](https://huggingface.co/settings/tokens)
2. Sign up or sign in
3. Click "New token"
4. Give it a name and select "Read" role
5. Copy the token
6. Add to your `.env` file: `HUGGING_FACE_API_KEY=your_token_here`

**Free Tier Limits:**
- 30,000 requests per month
- No credit card required

## 📝 Environment File Setup

Create a `.env` file in the `backend` folder with:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/jerry

# AI Service Configuration
GEMINI_API_KEY=your_gemini_api_key_here
HUGGING_FACE_API_KEY=your_huggingface_token_here

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

## 🔧 How It Works

The AI service tries multiple providers in this order:
1. **Google Gemini** - Best quality, free tier
2. **Hugging Face** - Good quality, free tier
3. **Local AI** - Intelligent fallback, always available

## ✅ Testing Your Setup

1. Start the backend server
2. Check the console output for API key status
3. Send a message in the AI chat
4. You should see real AI responses instead of dummy replies

## 🆘 Troubleshooting

### "No API key configured" message
- Make sure you've added the API keys to your `.env` file
- Restart the backend server after adding keys
- Check that the keys are correct (no extra spaces)

### Still getting dummy responses
- Check the backend console for error messages
- Verify your API keys are working
- Try the Hugging Face API as an alternative

### Rate limit errors
- The free tiers have limits, but they're generous for testing
- Wait a minute and try again
- Consider getting both API keys for redundancy

## 🎯 Next Steps

Once you have real AI working:
1. Test different types of questions
2. Try screen sharing with AI analysis
3. Explore the meeting features
4. Customize the AI responses for your needs

## 💡 Tips

- Start with Gemini API - it's the easiest to set up
- Both APIs are completely free for development
- The local AI fallback ensures the app always works
- You can switch between APIs by commenting out keys in `.env` 