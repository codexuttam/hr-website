"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Lightbulb, Trash2, Loader2 } from 'lucide-react';

// Types
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIMentorChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hi! I'm EduMate, your AI Career Mentor. I can help with resumes, interview prep, career guidance, coding questions, and more. How can I assist you today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const SUGGESTED_PROMPTS = [
    "How do I improve my resume for a software engineer role?",
    "What are the most asked interview questions for placements?",
    "Explain Dynamic Programming with an example",
    "Give me a 3-month study plan for placement preparation"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processChat = async (query: string, currentMessages: Message[]): Promise<string> => {
    try {
      // Build conversation history (only last 10 messages to avoid token limits)
      const conversationHistory = currentMessages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      console.log('Sending to API:', {
        messageCount: conversationHistory.length,
        query: query
      });

      // Call chat API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: conversationHistory
        })
      });

      console.log('API Response status:', response.status);

      // Handle rate limiting
      if (response.status === 429) {
        const errorData = await response.json();
        const retryAfter = errorData.usage?.limits ? 
          `\n\nLimits: ${errorData.usage.limits.perMinute} requests/minute, ${errorData.usage.limits.perHour} requests/hour` : '';
        
        return `⏱️ Rate Limit Reached\n\n${errorData.message || 'You have made too many requests. Please wait a moment and try again.'}${retryAfter}\n\nTip: Try asking different questions or wait a few minutes between requests.`;
      }

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API Error Response:', errorData);
        throw new Error(`API returned ${response.status}: ${errorData}`);
      }

      // Check if response was cached
      const isCached = response.headers.get('X-Cache-Hit') === 'true';
      if (isCached) {
        console.log('✅ Response served from CACHE (no API call made)');
      } else {
        console.log('📡 Response from API (new request)');
      }

      // Handle streaming response from AI SDK
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      if (!reader) {
        throw new Error('No response body available');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        fullResponse += chunk;
      }

      console.log('Full response received, length:', fullResponse.length);

      if (!fullResponse || fullResponse.trim().length === 0) {
        throw new Error('Empty response from AI');
      }

      return fullResponse;
    } catch (error: any) {
      console.error('Error calling AI API:', error);
      
      // More specific error messages
      if (error.message?.includes('API returned 400')) {
        return `Error: There was an issue with the request format. Please try rephrasing your question.`;
      } else if (error.message?.includes('API returned 401') || error.message?.includes('API returned 403')) {
        return `Error: Authentication issue. Please contact support.`;
      } else if (error.message?.includes('API returned 500')) {
        return `Error: The AI service encountered an error. Please check the console logs and try again.`;
      }
      
      // Fallback response
      return `I apologize, but I'm having trouble connecting right now. 

Error Details: ${error.message}

Here's what I can help you with:

Career Guidance:
• Resume building and optimization
• Interview preparation strategies
• Career path recommendations
• Skill development planning

Technical Help:
• Programming concepts and problem-solving
• Data structures and algorithms
• Core computer science subjects
• Project ideas and guidance

General Questions:
• Answer any questions you have
• Explain complex topics simply
• Provide step-by-step guidance
• Offer personalized advice

Please try again or check your internet connection.`;
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await processChat(currentInput, newMessages);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Handle submit error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I encountered an error. Please try again or rephrase your question.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: "Chat cleared! I'm ready to help you with your career journey. What would you like to know?",
      timestamp: new Date()
    }]);
  };

  return (
    <div className="relative min-h-screen bg-white dark:bg-slate-900" suppressHydrationWarning>
      {/* Background Effects */}
      <div aria-hidden="true" className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40 dark:opacity-20 pointer-events-none">
        <div className="blur-[106px] h-56 bg-gradient-to-br from-indigo-600 to-purple-500"></div>
        <div className="blur-[106px] h-32 bg-gradient-to-r from-cyan-400 to-sky-300"></div>
      </div>

      <div className="relative z-10 flex flex-col h-screen max-w-5xl mx-auto p-4" suppressHydrationWarning>
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-t-2xl shadow-lg p-4 border-b-2 border-indigo-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-500 p-3 rounded-xl">
                <Bot className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">EduMate AI Mentor</h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">Your 24/7 Career Guidance Assistant</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearChat}
                className="p-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg transition-colors"
                title="Clear chat"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Suggested Prompts */}
        {messages.length === 1 && !isLoading && (
          <div className="bg-white dark:bg-slate-800 px-4 py-3 border-b border-gray-100 dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {SUGGESTED_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(prompt)}
                  className="p-3 text-left bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-slate-600 dark:hover:to-slate-500 rounded-xl border border-indigo-200 dark:border-slate-600 transition-all text-sm flex items-start gap-2 group"
                >
                  <Lightbulb className="text-yellow-500 dark:text-yellow-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" size={16} />
                  <span className="text-gray-700 dark:text-gray-200">{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-800 p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-500' 
                    : 'bg-gradient-to-br from-cyan-400 to-sky-300'
                }`}>
                  {msg.role === 'user' ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
                </div>
                <div className={`rounded-2xl p-4 shadow-md ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600'
                }`}>
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                    {msg.content.split('\n').map((line, i) => {
                      // Remove all markdown formatting
                      const cleanLine = line
                        .replace(/\*\*/g, '') // Remove bold markers
                        .replace(/\*/g, '')   // Remove italic markers
                        .replace(/^#+\s+/g, '') // Remove heading markers
                        .replace(/^[-•]\s+/g, '• '); // Normalize bullet points
                      
                      if (cleanLine.trim() === '') {
                        return <br key={i} />;
                      }
                      return <p key={i} className={msg.role === 'user' ? 'text-white' : 'text-gray-700 dark:text-gray-300'}>{cleanLine}</p>;
                    })}
                  </div>
                  {isMounted && (
                    <div className={`text-xs mt-2 ${msg.role === 'user' ? 'text-indigo-200' : 'text-gray-400 dark:text-gray-500'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[85%]">
                <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-sky-300 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-slate-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-2xl p-4 shadow-md">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                    <Loader2 className="animate-spin" size={16} />
                    <span>EduMate is analyzing...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-slate-800 rounded-b-2xl shadow-lg p-4 border-t border-gray-100 dark:border-slate-700">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask EduMate anything about your career..."
              className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent text-slate-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              disabled={isLoading}
            />
            <button
              onClick={handleSubmit}
              disabled={isLoading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-500 text-white rounded-xl hover:from-indigo-700 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
            >
              <Send size={18} />
              <span>Send</span>
            </button>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
            💡 Ask me anything - career advice, coding help, interview prep, and more!
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AIMentorChatbot;