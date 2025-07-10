// src/components/KarmicReportChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { generateChatResponse } from './services/gptReportGenerator';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase/config';
import { useAuth } from './context/AuthContext';

const KarmicReportChat = ({ userData }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const messagesEndRef = useRef(null);
  const { currentUser } = useAuth();

  const FREE_QUESTION_LIMIT = 5;

  // Load existing chat data and question count from Firebase
  useEffect(() => {
    loadChatData();
  }, [currentUser]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatData = async () => {
    if (!currentUser?.uid) return;

    try {
      const chatDoc = await getDoc(doc(db, 'karmicReportChats', currentUser.uid));
      if (chatDoc.exists()) {
        const chatData = chatDoc.data();
        setMessages(chatData.messages || []);
        setQuestionsUsed(chatData.questionsUsed || 0);
      } else {
        // Initialize with welcome message
        const welcomeMessage = {
          role: 'assistant',
          content: `🌟 Welcome to your cosmic consultation! I'm here to help you understand your karmic report and birth charts.\n\n✨ You have **${FREE_QUESTION_LIMIT} free questions** to explore your astrological insights.\n\nWhat would you like to know about your cosmic blueprint?`,
          timestamp: new Date().toISOString()
        };
        setMessages([welcomeMessage]);
        await saveChatData([welcomeMessage], 0);
      }
    } catch (error) {
      console.error('Error loading chat data:', error);
    }
  };

  const saveChatData = async (newMessages, newQuestionCount) => {
    if (!currentUser?.uid) return;

    try {
      await setDoc(doc(db, 'karmicReportChats', currentUser.uid), {
        messages: newMessages,
        questionsUsed: newQuestionCount,
        lastUpdated: new Date(),
        userId: currentUser.uid
      });
    } catch (error) {
      console.error('Error saving chat data:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Check question limit
    if (questionsUsed >= FREE_QUESTION_LIMIT) {
      setShowUpgradeModal(true);
      return;
    }

    const userMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    try {
      // Generate AI response
      const chatHistory = updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await generateChatResponse(
        userMessage.content,
        userData,
        chatHistory.slice(-10) // Last 10 messages for context
      );

      const assistantMessage = {
        role: 'assistant',
        content: response.success ? response.response : '🌟 The cosmic energies are a bit scattered right now. Please try asking your question again.',
        timestamp: new Date().toISOString(),
        tokensUsed: response.tokensUsed || 0
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      const newQuestionCount = questionsUsed + 1;

      setMessages(finalMessages);
      setQuestionsUsed(newQuestionCount);
      
      // Save to Firebase
      await saveChatData(finalMessages, newQuestionCount);

    } catch (error) {
      console.error('Error generating chat response:', error);
      
      const errorMessage = {
        role: 'assistant',
        content: '🌟 I\'m experiencing some cosmic interference. Please try again in a moment.',
        timestamp: new Date().toISOString()
      };

      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const UpgradeModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md mx-4">
        <div className="text-center">
          <div className="text-6xl mb-4">✨</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Unlock Unlimited Cosmic Wisdom
          </h3>
          <p className="text-gray-600 mb-6">
            You've used your {FREE_QUESTION_LIMIT} free questions! Upgrade to Pro for unlimited conversations with your cosmic guide.
          </p>
          
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Pro Features:</h4>
              <ul className="text-left text-sm text-gray-700 space-y-1">
                <li>🔮 Unlimited chart questions</li>
                <li>📊 Advanced astrology insights</li>
                <li>⏰ Real-time transit updates</li>
                <li>💫 Personalized predictions</li>
              </ul>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Maybe Later
              </button>
              <button
                onClick={() => {
                  // Handle upgrade logic here
                  window.open('/upgrade', '_blank');
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Chat Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold">🔮 Cosmic Consultation</h3>
            <p className="text-sm opacity-90">Ask questions about your karmic report</p>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Questions Used</div>
            <div className="text-lg font-bold">
              {questionsUsed} / {FREE_QUESTION_LIMIT}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border shadow-sm'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="flex items-center mb-2">
                  <span className="text-purple-600 mr-2">🔮</span>
                  <span className="text-sm font-medium text-purple-600">Cosmic Guide</span>
                </div>
              )}
              <div className="whitespace-pre-wrap text-sm">
                {message.content}
              </div>
              <div className={`text-xs mt-1 opacity-70 ${
                message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border shadow-sm rounded-lg px-4 py-2 max-w-xs">
              <div className="flex items-center space-x-2">
                <span className="text-purple-600">🔮</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4 bg-white">
        {questionsUsed >= FREE_QUESTION_LIMIT ? (
          <div className="text-center">
            <p className="text-gray-600 mb-3">
              You've reached your free question limit
            </p>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors"
            >
              ✨ Upgrade for Unlimited Questions
            </button>
          </div>
        ) : (
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about your chart, relationships, career..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputValue.trim()}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? '⏳' : '📤'}
            </button>
          </div>
        )}
        
        <div className="mt-2 text-xs text-gray-500 text-center">
          {questionsUsed < FREE_QUESTION_LIMIT && (
            <span>
              {FREE_QUESTION_LIMIT - questionsUsed} questions remaining • 
              <button 
                onClick={() => setShowUpgradeModal(true)}
                className="text-purple-600 hover:underline ml-1"
              >
                Upgrade for unlimited
              </button>
            </span>
          )}
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && <UpgradeModal />}
    </div>
  );
};

export default KarmicReportChat;