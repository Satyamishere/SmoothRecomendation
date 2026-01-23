import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Sparkles, Globe2, Compass } from 'lucide-react';
import QuickSuggestions from './QuickSuggestions'; // Import the new component
import './WelcomeScreen.css';

const WelcomeScreen = ({ onStart }) => {
  return (
    <motion.div 
      className="welcome-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="welcome-layout">
        
        {/* Left Column: Text & CTA */}
        <div className="hero-content">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="hero-badge">
              <Sparkles size={14} className="badge-icon" />
              <span>AI-Powered Search Bar</span>
            </div>
            
            <h1 className="hero-title">
              Your Dream Trip, <br />
              <span className="text-highlight">Just One Search Away.</span>
            </h1>
            
            <p className="hero-subtitle">
              Stop spending hours researching. Tell TravelGenie your budget and interests, 
              and get a fully personalized itinerary, hotels, and costs in seconds.
            </p>

            <motion.button 
              className="cta-button"
              onClick={onStart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <MessageSquare className="cta-icon" />
              Start Planning Now
              <div className="button-glow"></div>
            </motion.button>
          </motion.div>

          {/* Quick Suggestions - Now integrated here for better flow */}
          <div className="hero-suggestions">
             <QuickSuggestions onSuggestionClick={onStart} /> 
          </div>
        </div>

        {/* Right Column: Visual Collage */}
        <div className="hero-visuals">
            {/* Floating Card 1: Japan */}
            <motion.div 
              className="visual-card card-1"
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <img src="https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600&auto=format&fit=crop" alt="Japan" />
              <div className="visual-badge glass">
                 <Globe2 size={14} /> Tokyo, Japan
              </div>
            </motion.div>

            {/* Floating Card 2: Paris */}
            <motion.div 
              className="visual-card card-2"
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <img src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600&auto=format&fit=crop" alt="Paris" />
              <div className="visual-badge glass">
                 <Compass size={14} /> Paris, France
              </div>
            </motion.div>
            
            {/* Background Glow Element */}
            <div className="hero-glow"></div>
        </div>
      </div>
    </motion.div>
  );
};

export default WelcomeScreen;