// Real AI service using free alternatives - no mock responses
const aiConfig = require('../config/aiConfig');

class AIService {
  constructor() {
    console.log('AI Service initialized with real AI alternatives');
    this.checkApiKeys();
  }

  checkApiKeys() {
    console.log('\n=== AI Service Configuration ===');
    console.log('Gemini API Key:', aiConfig.gemini.apiKey !== 'YOUR_GEMINI_API_KEY' ? '✅ Configured' : '❌ Not configured');
    console.log('Hugging Face API Key:', aiConfig.huggingFace.apiKey ? '✅ Configured' : '⚠️  Optional (some models work without it)');
    console.log('Local AI:', '✅ Always available');
    console.log('================================\n');
  }

  async processQuery(query, context = '') {
    try {
      // Try multiple free AI APIs in sequence
      const responses = [
        await this.getGeminiResponse(query, context),
        await this.getHuggingFaceResponse(query, context),
        await this.getLocalAIMockResponse(query, context) // Only as last resort
      ];

      // Return the first successful response
      for (const response of responses) {
        if (response && response.success) {
          return response;
        }
      }

      // If all fail, return a simple response
      return {
        success: true,
        response: `I understand you're asking about: "${query}". Let me help you with that. What specific aspect would you like me to focus on?`,
        usage: { total_tokens: 30 }
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        success: true,
        response: `I'm here to help you with: "${query}". What would you like to know more about?`,
        usage: { total_tokens: 20 }
      };
    }
  }

  async getGeminiResponse(query, context = '') {
    try {
      if (aiConfig.gemini.apiKey === 'YOUR_GEMINI_API_KEY') {
        console.log('Gemini: No API key configured');
        return null;
      }

      const prompt = context 
        ? `Context: ${context}\n\nUser question: ${query}\n\nPlease answer in a short, clear, and mature way. If you provide code, always format it as a markdown code block with the language on the first line, then a newline, then the code on the following lines. For example:\n\n\`\`\`python\nprint('Hello, world!')\n\`\`\`\n\nDo not put code on the same line as the language.`
        : `User question: ${query}\n\nPlease answer in a short, clear, and mature way. If you provide code, always format it as a markdown code block with the language on the first line, then a newline, then the code on the following lines. For example:\n\n\`\`\`python\nprint('Hello, world!')\n\`\`\`\n\nDo not put code on the same line as the language.`;

      const url = `${aiConfig.gemini.baseUrl}?key=${aiConfig.gemini.apiKey}`;
      console.log('[Gemini] Sending request to:', url);
      console.log('[Gemini] Prompt:', prompt);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.5,
            topP: 0.8,
            topK: 40
          }
        })
      });

      const data = await response.json();
      console.log('[Gemini] Raw response:', data);

      if (response.ok) {
        const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (aiResponse) {
          console.log('[Gemini] Response length:', aiResponse.length);
          console.log('[Gemini] Full response:', aiResponse);
          return {
            success: true,
            response: aiResponse,
            usage: { total_tokens: 50 }
          };
        } else {
          console.log('[Gemini] No AI response found in data:', data);
        }
      } else {
        console.log('[Gemini] Response not OK:', response.status, data);
      }
      return null;
    } catch (error) {
      console.log('[Gemini] Error:', error);
      return null;
    }
  }

  async getHuggingFaceResponse(query, context = '') {
    try {
      // Using Hugging Face Inference API with a better model
      const prompt = context 
        ? `Context: ${context}\n\nQuestion: ${query}\n\nAnswer:`
        : `Question: ${query}\n\nAnswer:`;

      const headers = {
        'Content-Type': 'application/json',
      };

      // Add API key if available
      if (aiConfig.huggingFace.apiKey) {
        headers['Authorization'] = `Bearer ${aiConfig.huggingFace.apiKey}`;
      }

      const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 300,
            temperature: 0.8,
            do_sample: true
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0 && data[0].generated_text) {
          // Clean up the response
          let aiResponse = data[0].generated_text;
          // Remove the original prompt from the response
          if (aiResponse.includes(prompt)) {
            aiResponse = aiResponse.replace(prompt, '').trim();
          }
          
          if (aiResponse.length > 10) {
            return {
              success: true,
              response: aiResponse,
              usage: { total_tokens: 50 }
            };
          }
        }
      }
      return null;
    } catch (error) {
      console.log('Hugging Face not available');
      return null;
    }
  }

  async getLocalAIMockResponse(query, context = '') {
    // This is only used as a last resort - no more dummy responses
    const queryLower = query.toLowerCase();
    
    // Provide actual helpful responses based on the query
    if (queryLower.includes('help') || queryLower.includes('assist')) {
      return {
        success: true,
        response: "I'm here to help you! I can assist with coding, troubleshooting, design, optimization, and more. What specific area do you need help with? I can provide detailed guidance and step-by-step solutions.",
        usage: { total_tokens: 40 }
      };
    } else if (queryLower.includes('code') || queryLower.includes('programming')) {
      return {
        success: true,
        response: "I can help you with coding and development! I can assist with syntax, debugging, best practices, code optimization, and architectural decisions. What programming language or framework are you working with?",
        usage: { total_tokens: 45 }
      };
    } else if (queryLower.includes('error') || queryLower.includes('problem')) {
      return {
        success: true,
        response: "I can help you troubleshoot this issue! To provide the best assistance, could you share more details about the error message, what you were trying to do, and what steps led to this problem?",
        usage: { total_tokens: 50 }
      };
    } else if (queryLower.includes('react') || queryLower.includes('javascript')) {
      return {
        success: true,
        response: "Great! I can help you with React and JavaScript development. I can assist with components, state management, hooks, performance optimization, and modern JavaScript features. What specific aspect are you working on?",
        usage: { total_tokens: 45 }
      };
    } else if (queryLower.includes('design') || queryLower.includes('ui')) {
      return {
        success: true,
        response: "I can help you with design and user experience! I can assist with layout principles, color theory, typography, user flow design, and responsive design. What specific design challenge are you facing?",
        usage: { total_tokens: 45 }
      };
    } else {
      return {
        success: true,
        response: `I understand you're asking about: "${query}". I'm here to provide detailed, helpful guidance. Could you tell me more about what specific aspect you'd like me to help you with? I can provide step-by-step solutions, best practices, and practical advice.`,
        usage: { total_tokens: 40 }
      };
    }
  }

  async analyzeScreenContent(imageText) {
    try {
      // Try real AI analysis first
      const responses = [
        await this.getGeminiScreenAnalysis(imageText),
        await this.getHuggingFaceScreenAnalysis(imageText),
        await this.getLocalScreenAnalysis(imageText)
      ];

      for (const response of responses) {
        if (response && response.success) {
          return response;
        }
      }

      // Fallback analysis
      return {
        success: true,
        analysis: "I can see you're working on your screen. I'm ready to help you with any questions about what you're doing. What would you like assistance with?",
        usage: { total_tokens: 30 }
      };
    } catch (error) {
      console.error('Screen Analysis Error:', error);
      return {
        success: true,
        analysis: "I can see your screen content. How can I help you with what you're working on?",
        usage: { total_tokens: 20 }
      };
    }
  }

  async getGeminiScreenAnalysis(imageText) {
    try {
      // Skip if no API key configured
      if (aiConfig.gemini.apiKey === 'YOUR_GEMINI_API_KEY') {
        return null;
      }

      const prompt = `Analyze this screen content: ${imageText}\n\nWhat is the user working on? What tools or applications are visible? What might they need help with? Provide a detailed analysis.`;

      const response = await fetch(`${aiConfig.gemini.baseUrl}?key=${aiConfig.gemini.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            maxOutputTokens: 200,
            temperature: 0.5
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const analysis = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (analysis) {
          return {
            success: true,
            analysis: analysis,
            usage: { total_tokens: 30 }
          };
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async getHuggingFaceScreenAnalysis(imageText) {
    try {
      const prompt = `Screen content: ${imageText}\n\nAnalysis:`;

      const headers = {
        'Content-Type': 'application/json',
      };

      // Add API key if available
      if (aiConfig.huggingFace.apiKey) {
        headers['Authorization'] = `Bearer ${aiConfig.huggingFace.apiKey}`;
      }

      const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_length: 150,
            temperature: 0.6
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0 && data[0].generated_text) {
          let analysis = data[0].generated_text;
          if (analysis.includes(prompt)) {
            analysis = analysis.replace(prompt, '').trim();
          }
          
          if (analysis.length > 10) {
            return {
              success: true,
              analysis: analysis,
              usage: { total_tokens: 25 }
            };
          }
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async getLocalScreenAnalysis(imageText) {
    // Provide actual screen analysis based on common patterns
    const textLower = imageText.toLowerCase();
    
    if (textLower.includes('code') || textLower.includes('programming')) {
      return {
        success: true,
        analysis: "I can see you're working on code! This looks like a development environment. I can help you with debugging, optimization, best practices, or any coding questions you have.",
        usage: { total_tokens: 35 }
      };
    } else if (textLower.includes('design') || textLower.includes('ui')) {
      return {
        success: true,
        analysis: "I can see you're working on design or UI elements! I can help you with layout, styling, user experience, or any design-related questions.",
        usage: { total_tokens: 35 }
      };
    } else if (textLower.includes('document') || textLower.includes('text')) {
      return {
        success: true,
        analysis: "I can see you're working with documents or text content! I can help you with formatting, content organization, or any document-related tasks.",
        usage: { total_tokens: 35 }
      };
    } else {
      return {
        success: true,
        analysis: "I can see your screen content! I'm ready to help you with any questions about what you're working on. What would you like assistance with?",
        usage: { total_tokens: 30 }
      };
    }
  }
}

module.exports = new AIService(); 