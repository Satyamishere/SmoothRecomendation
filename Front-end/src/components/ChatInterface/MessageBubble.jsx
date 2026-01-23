import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Sparkles } from 'lucide-react';
import './ChatInterface.css'; // Shared styles or specific bubble styles

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';
  
  return (
    <motion.div 
      className={`message-bubble ${isUser ? 'user' : 'assistant'}`}
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        gap: '1rem',
        alignItems: 'flex-start',
        marginBottom: '1rem'
      }}
    >
      {/* Avatar */}
      <div style={{
        flexShrink: 0,
        width: 36,
        height: 36,
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isUser ? 'linear-gradient(135deg, #EC4899, #8B5CF6)' : 'rgba(255,255,255,0.05)',
        border: isUser ? 'none' : '1px solid rgba(255,255,255,0.1)',
        boxShadow: isUser ? '0 4px 12px rgba(236, 72, 153, 0.3)' : 'none'
      }}>
        {isUser ? (
          <User size={18} color="white" />
        ) : (
          <Bot size={18} color="#A78BFA" />
        )}
      </div>
      
      {/* Content */}
      <div style={{
        maxWidth: '75%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
      }}>
        <div style={{
          padding: '1rem 1.25rem',
          borderRadius: isUser ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
          background: isUser 
            ? 'linear-gradient(135deg, #6366F1, #8B5CF6)' 
            : 'rgba(255, 255, 255, 0.05)',
          border: isUser ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
          color: 'white',
          lineHeight: '1.6',
          fontSize: '0.95rem',
          boxShadow: isUser ? '0 4px 15px rgba(99, 102, 241, 0.3)' : 'none'
        }}>
          {message.content}
        </div>
        <span style={{
          fontSize: '0.7rem',
          color: 'rgba(255,255,255,0.4)',
          marginTop: '0.5rem',
          padding: '0 0.5rem'
        }}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
};

export default MessageBubble;