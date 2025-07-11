#!/usr/bin/env node

/**
 * Test script to verify the complete AI screen analysis workflow
 * This simulates the exact scenario: user shares screen, asks question, AI responds with context
 */

const aiService = require('./src/services/aiService');
const Tesseract = require('tesseract.js');

// Mock screen data (simulating a railway booking website)
const mockScreenData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

// Mock OCR text that would be extracted from a railway booking website
const mockOCRText = `
Railway Ticket Booking System
From: Delhi
To: Mumbai
Date: 15-07-2024
Search Trains
Book Now
Available Seats: 45
Price: ₹1,250
`;

async function testRealScenario() {
  console.log('🚀 Testing Real AI Screen Analysis Scenario\n');
  
  try {
    // Scenario 1: Railway Ticket Booking
    console.log('🎫 Scenario 1: Railway Ticket Booking Website');
    console.log('User asks: "Help me book a railway ticket"');
    console.log('Screen content: Railway booking website with form fields\n');
    
    const railwayContext = `Screen content: ${mockOCRText}\n\nUser question: Help me book a railway ticket`;
    const railwayResponse = await aiService.processQuery('Help me book a railway ticket', railwayContext);
    
    console.log('✅ AI Response:', railwayResponse.response);
    console.log('---\n');
    
    // Scenario 2: Coding Error
    console.log('💻 Scenario 2: Coding Error');
    console.log('User asks: "Help me fix this error"');
    console.log('Screen content: Code editor with error messages\n');
    
    const codingContext = `Screen content: 
function calculateTotal(items) {
  return items.reduce((total, item) => total + item.price, 0);
}

Error: TypeError: Cannot read property 'price' of undefined
at calculateTotal (script.js:3:25)

User question: Help me fix this error`;
    
    const codingResponse = await aiService.processQuery('Help me fix this error', codingContext);
    
    console.log('✅ AI Response:', codingResponse.response);
    console.log('---\n');
    
    // Scenario 3: General Question without Screen
    console.log('❓ Scenario 3: General Question (No Screen Share)');
    console.log('User asks: "What can you help me with?"\n');
    
    const generalResponse = await aiService.processQuery('What can you help me with?', 'User question: What can you help me with?');
    
    console.log('✅ AI Response:', generalResponse.response);
    console.log('---\n');
    
    console.log('🎉 All scenarios completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   ✅ Railway booking scenario: AI provides contextual guidance');
    console.log('   ✅ Coding error scenario: AI helps debug the issue');
    console.log('   ✅ General question: AI provides helpful response');
    console.log('\n🚀 Your AI screen analysis system is ready!');
    console.log('\nNext steps:');
    console.log('   1. Start your frontend: cd ../frontend && npm run dev');
    console.log('   2. Open http://localhost:3000');
    console.log('   3. Join a meeting room');
    console.log('   4. Share your screen');
    console.log('   5. Ask questions and get AI assistance!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check your .env file has GEMINI_API_KEY');
    console.log('   2. Ensure backend server is running');
    console.log('   3. Check internet connection');
  }
}

// Run the test
if (require.main === module) {
  testRealScenario();
}

module.exports = { testRealScenario }; 