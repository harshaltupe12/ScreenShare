#!/usr/bin/env node

/**
 * Test script for the chat-with-screenshot endpoint
 * Run with: node test-endpoint.js
 */

const fetch = require('node-fetch');

async function testEndpoint() {
  console.log('🧪 Testing chat-with-screenshot endpoint...\n');

  const testData = {
    message: "Hello, this is a test message",
    screenSnapshot: null,
    meetingId: "test-meeting-123",
    userId: "test-user-456",
    hasScreenShare: false
  };

  try {
    console.log('📤 Sending request with data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:5000/api/ai/chat-with-screenshot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    const responseData = await response.text();
    console.log('📥 Response body:', responseData);

    if (response.ok) {
      console.log('\n✅ Endpoint test successful!');
    } else {
      console.log('\n❌ Endpoint test failed!');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Test with missing message
async function testMissingMessage() {
  console.log('\n🧪 Testing with missing message...\n');

  const testData = {
    screenSnapshot: null,
    meetingId: "test-meeting-123",
    userId: "test-user-456",
    hasScreenShare: false
  };

  try {
    console.log('📤 Sending request with data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:5000/api/ai/chat-with-screenshot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('📥 Response status:', response.status);
    const responseData = await response.text();
    console.log('📥 Response body:', responseData);

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Test with empty message
async function testEmptyMessage() {
  console.log('\n🧪 Testing with empty message...\n');

  const testData = {
    message: "",
    screenSnapshot: null,
    meetingId: "test-meeting-123",
    userId: "test-user-456",
    hasScreenShare: false
  };

  try {
    console.log('📤 Sending request with data:', JSON.stringify(testData, null, 2));
    
    const response = await fetch('http://localhost:5000/api/ai/chat-with-screenshot', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('📥 Response status:', response.status);
    const responseData = await response.text();
    console.log('📥 Response body:', responseData);

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run tests
async function runTests() {
  await testEndpoint();
  await testMissingMessage();
  await testEmptyMessage();
}

if (require.main === module) {
  runTests();
}

module.exports = { testEndpoint, testMissingMessage, testEmptyMessage }; 