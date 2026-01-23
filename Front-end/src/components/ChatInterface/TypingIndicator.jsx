import React from 'react';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

const TypingIndicator = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        marginBottom: '1rem'
      }}
    >
      <div style={{
        width: 36,
        height: 36,
        borderRadius: '10px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Bot size={18} color="#A78BFA" />
      </div>
      
      <div style={{
        padding: '1rem',
        borderRadius: '20px 20px 20px 4px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        height: '40px'
      }}>
        {[1, 2, 3].map((dot) => (
          <motion.div
            key={dot}
            style={{
              width: '6px',
              height: '6px',
              background: '#A78BFA',
              borderRadius: '50%'
            }}
            animate={{
              y: [-3, 3, -3],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: dot * 0.2,
              ease: "easeInOut"
            }}
          />
        ))}
        <span style={{ fontSize: '0.8rem', color: '#94A3B8', marginLeft: '8px' }}>
          Thinking...
        </span>
      </div>
    </motion.div>
  );
};

export default TypingIndicator;