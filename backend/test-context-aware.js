const aiService = require('./src/services/aiService');
const AISessionService = require('./src/services/aiSessionService');
const mongoose = require('mongoose');

async function testContextAwareAI() {
  console.log('🧪 Testing Context-Aware AI...\n');

  // Create a test session
  const sessionId = 'test-session-' + Date.now();
  const userId = new mongoose.Types.ObjectId(); // Use proper ObjectId

  try {
    // Create session
    console.log('📝 Creating test session...');
    const sessionResult = await AISessionService.createSession(userId, sessionId, {
      userAgent: 'Test Script',
      ipAddress: '127.0.0.1',
      deviceInfo: 'Test Environment'
    });

    if (!sessionResult.success) {
      throw new Error('Failed to create session: ' + sessionResult.error);
    }
    console.log('✅ Session created:', sessionId);

    // Test 1: First message (no context)
    console.log('\n🔍 Test 1: First message (no context)');
    const response1 = await aiService.processQuery(
      "Hello! My name is John and I'm working on a React project.",
      "User is starting a new conversation",
      sessionId,
      userId
    );
    console.log('AI Response 1:', response1.response);

    // Save the first exchange
    await AISessionService.saveMessage(sessionId, userId, {
      senderType: 'user',
      content: "Hello! My name is John and I'm working on a React project.",
      messageType: 'text'
    });

    await AISessionService.saveMessage(sessionId, userId, {
      senderType: 'ai',
      content: response1.response,
      messageType: 'text'
    });

    // Test 2: Second message (should have context)
    console.log('\n🔍 Test 2: Second message (with context)');
    const response2 = await aiService.processQuery(
      "What was my name again?",
      "User is asking for their name",
      sessionId,
      userId
    );
    console.log('AI Response 2:', response2.response);

    // Save the second exchange
    await AISessionService.saveMessage(sessionId, userId, {
      senderType: 'user',
      content: "What was my name again?",
      messageType: 'text'
    });

    await AISessionService.saveMessage(sessionId, userId, {
      senderType: 'ai',
      content: response2.response,
      messageType: 'text'
    });

    // Test 3: Third message (should have more context)
    console.log('\n🔍 Test 3: Third message (with more context)');
    const response3 = await aiService.processQuery(
      "Can you help me with my React project?",
      "User is asking for help with their React project",
      sessionId,
      userId
    );
    console.log('AI Response 3:', response3.response);

    // Test 4: Check conversation history
    console.log('\n📚 Test 4: Checking conversation history');
    const historyResult = await AISessionService.getSessionHistory(sessionId, userId, 10);
    if (historyResult.success) {
      console.log('✅ Conversation history retrieved:');
      historyResult.messages.forEach((msg, index) => {
        console.log(`${index + 1}. ${msg.senderType}: ${msg.content.substring(0, 100)}...`);
      });
    } else {
      console.log('❌ Failed to retrieve conversation history:', historyResult.error);
    }

    // Test 5: Test without session (should not have context)
    console.log('\n🔍 Test 5: Message without session (no context)');
    const response4 = await aiService.processQuery(
      "What was my name again?",
      "User is asking for their name without session context"
    );
    console.log('AI Response 4 (no context):', response4.response);

    console.log('\n🎉 Context-Aware AI Test Completed!');
    console.log('\n📊 Summary:');
    console.log('- Test 1: First message (no context)');
    console.log('- Test 2: Second message (with context)');
    console.log('- Test 3: Third message (with more context)');
    console.log('- Test 4: Conversation history verification');
    console.log('- Test 5: Message without session (no context)');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Clean up - end the session
    try {
      await AISessionService.endSession(sessionId, userId);
      console.log('\n🧹 Test session cleaned up');
    } catch (cleanupError) {
      console.error('⚠️ Cleanup error:', cleanupError);
    }
  }
}

// Run the test
testContextAwareAI().catch(console.error); 