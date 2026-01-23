import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Map, Zap, Shield, ArrowLeft } from 'lucide-react';
import ChatInterface from './components/ChatInterface/ChatInterface';
import TripCard from './components/TripDisplay/TripCard';
import WelcomeScreen from './components/Common/WelcomeScreen';
import './App.css';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentTrip, setCurrentTrip] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [viewMode, setViewMode] = useState('chat'); // 'chat' or 'trip' for mobile

  // Handle Resize for Responsive Layouts
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleStartChat = () => {
    setShowWelcome(false);
  };

  const handleTripGenerated = (trip) => {
    setCurrentTrip(trip);
    setIsGenerating(false);
    if (isMobile) setViewMode('trip');
  };

  const handleGoHome = () => {
    setShowWelcome(true);
    setCurrentTrip(null);
    setIsGenerating(false);
    setViewMode('chat');
  };

  return (
    <div className="app">
      {/* Animated Background */}
      <div className="animated-bg">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Header */}
      <header className="app-header">
        <motion.div 
          className="logo-container"
          onClick={handleGoHome}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="logo">
            <Sparkles className="logo-icon" />
            <h1 className="logo-text">TravelGenie</h1>
          </div>
          <p className="tagline">AI Travel Companion</p>
        </motion.div>

        <motion.div 
          className="header-stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="stat" title="Response Time">
            <Zap className="stat-icon" />
            <span>Fast</span>
          </div>
          <div className="stat" title="AI Reliability">
            <Shield className="stat-icon" />
            <span>Secure</span>
          </div>
          <div className="stat" title="Global Coverage">
            <Map className="stat-icon" />
            <span>Global</span>
          </div>
        </motion.div>
      </header>

      {/* Main Content */}
      <main className="app-main">
        <AnimatePresence mode="wait">
          {showWelcome ? (
            <WelcomeScreen key="welcome" onStart={handleStartChat} />
          ) : (
            <motion.div 
              key="chat"
              className="chat-container"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="chat-layout">
                {/* Chat Interface Section */}
                <div 
                  className="chat-section" 
                  style={{ 
                    display: isMobile && viewMode === 'trip' ? 'none' : 'flex' 
                  }}
                >
                  <ChatInterface 
                    onTripGenerated={handleTripGenerated}
                    onGeneratingStart={() => setIsGenerating(true)}
                  />
                </div>

                {/* Trip Display Section */}
                <AnimatePresence>
                  {currentTrip && (
                   (!isMobile || (isMobile && viewMode === 'trip')) && (
                    <motion.div 
                      className="trip-section"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: isMobile ? '100%' : 450 }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    >
                      {isMobile && (
                        <button 
                          onClick={() => setViewMode('chat')}
                          style={{
                            padding: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            color: 'white',
                            background: 'transparent',
                            borderBottom: '1px solid rgba(255,255,255,0.1)'
                          }}
                        >
                          <ArrowLeft size={20} /> Back to Chat
                        </button>
                      )}
                      <TripCard trip={currentTrip} />
                    </motion.div>
                   )
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="app-footer">
        <p>Built for TBO Hackathon 2026</p>
      </footer>
    </div>
  );
}

export default App;