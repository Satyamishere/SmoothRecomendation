import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles } from 'lucide-react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import QuickSuggestions from '../Common/QuickSuggestions';
import './ChatInterface.css';

const ChatInterface = ({ onTripGenerated, onGeneratingStart }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "Hi! I'm TravelGenie 🧞‍♂️ Where would you like to go?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isSending) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsSending(true);
    setIsTyping(true);

    // Simulate API call (replace with actual API)
    setTimeout(() => {
      const response = generateMockResponse(userMessage.content);
      
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.message,
        timestamp: new Date(),
        trip: response.trip
      }]);

      if (response.trip) {
        onTripGenerated(response.trip);
      }

      setIsSending(false);
    }, 2000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const generateMockResponse = (userInput) => {
    const lower = userInput.toLowerCase();
    
    // Check if it's a trip planning query
    if (lower.includes('trip') || lower.includes('plan') || lower.includes('go to')) {
      onGeneratingStart();
      return {
        message: "Perfect! I've created your ideal itinerary. Check it out on the right! ✨",
        trip: {
          tripId: 'trip_' + Date.now(),
          destination: { primary: 'Goa' },
          duration: 5,
          budget: {
            total: 50000,
            spent: 41000,
            remaining: 9000,
            allocated: {
              transport: 6000,
              accommodation: 12000,
              activities: 15000,
              food: 5000,
              miscellaneous: 3000
            }
          },
          itinerary: [
            {
              day: 1,
              date: '2024-02-01',
              items: [
                { type: 'flight', name: 'Flight to Goa', time: '10:00 AM', cost: 6000 },
                { type: 'hotel', name: 'Check-in: Taj Resort', time: '2:00 PM', cost: 0 },
                { type: 'activity', name: 'Beach relaxation', time: '4:00 PM', cost: 0 }
              ]
            },
            {
              day: 2,
              items: [
                { type: 'activity', name: 'Water Sports', time: '10:00 AM', cost: 3000 },
                { type: 'meal', name: 'Beach shack lunch', time: '1:00 PM', cost: 800 },
                { type: 'activity', name: 'Sunset cruise', time: '5:00 PM', cost: 2000 }
              ]
            },
            {
              day: 3,
              items: [
                { type: 'activity', name: 'Dudhsagar Falls trek', time: '8:00 AM', cost: 2500 },
                { type: 'activity', name: 'Spice plantation visit', time: '2:00 PM', cost: 1500 }
              ]
            },
            {
              day: 4,
              items: [
                { type: 'activity', name: 'Old Goa heritage tour', time: '10:00 AM', cost: 1000 },
                { type: 'activity', name: 'Anjuna flea market', time: '3:00 PM', cost: 0 },
                { type: 'meal', name: 'Seafood dinner', time: '7:00 PM', cost: 1500 }
              ]
            },
            {
              day: 5,
              items: [
                { type: 'hotel', name: 'Check-out', time: '11:00 AM', cost: 0 },
                { type: 'flight', name: 'Return flight', time: '2:00 PM', cost: 0 }
              ]
            }
          ],
          optimization: {
            score: 92,
            reasoning: 'Perfect match for your beach + adventure preferences'
          }
        }
      };
    }

    // Default responses
    const responses = [
      "Tell me more! What's your budget and how many days?",
      "That sounds exciting! Where would you like to go?",
      "Great choice! Let me know your budget and duration.",
      "I can help with that! What's your travel style - adventure, relaxation, or cultural?"
    ];

    return {
      message: responses[Math.floor(Math.random() * responses.length)]
    };
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <div className="chat-header-content">
          <Sparkles className="chat-header-icon" />
          <div>
            <h2 className="chat-title">TravelGenie</h2>
            <p className="chat-subtitle">AI Travel Companion</p>
          </div>
        </div>
        <div className="chat-status">
          <div className="status-dot"></div>
          <span>Online</span>
        </div>
      </div>

      <div className="messages-container">
        <div className="messages-list">
          <AnimatePresence>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </AnimatePresence>

          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {messages.length === 1 && (
          <QuickSuggestions onSuggestionClick={handleSuggestionClick} />
        )}
      </div>

      <div className="chat-input-container">
        <div className="input-wrapper">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tell me where you want to go..."
            className="chat-input"
            rows="1"
            disabled={isSending}
          />
          <motion.button
            className={`send-button ${inputValue.trim() ? 'active' : ''}`}
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isSending}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSending ? (
              <Loader2 className="button-icon spinning" />
            ) : (
              <Send className="button-icon" />
            )}
          </motion.button>
        </div>
        <p className="input-hint">
          Press <kbd>Enter</kbd> to send • <kbd>Shift + Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;