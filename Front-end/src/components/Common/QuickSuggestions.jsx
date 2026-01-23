import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight } from 'lucide-react';
import './QuickSuggestions.css';

const QuickSuggestions = ({ onSuggestionClick }) => {
  const suggestions = [
    {
      id: 1,
      text: "Goa Beach Vibes",
      sub: "5 Days • < ₹50k",
      query: "Plan a 5-day beach vacation to Goa under 50k",
      img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 2,
      text: "Ladakh Adventure",
      sub: "7 Days • Bike Trip",
      query: "Adventure trip to Ladakh for 7 days, budget 80k",
      img: "https://images.unsplash.com/photo-1482160549825-59d1b23cb208?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 3,
      text: "Royal Jaipur",
      sub: "3 Days • Cultural",
      query: "3-day cultural tour of Jaipur under 30k",
      img: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 4,
      text: "Thailand Escape",
      sub: "International • 5 Days",
      query: "Plan a Thailand trip for 5 days under 1 lakh",
      img: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=800&auto=format&fit=crop"
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="quick-suggestions-container"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <div className="section-header">
        <MapPin className="header-icon" size={18} />
        <span className="header-text">Trending Destinations</span>
      </div>
      
      <div className="suggestions-grid">
        {suggestions.map((suggestion) => (
          <motion.button
            key={suggestion.id}
            className="suggestion-card"
            variants={item}
            whileHover={{ y: -5, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSuggestionClick(suggestion.query)}
            style={{ backgroundImage: `url(${suggestion.img})` }}
          >
            <div className="card-overlay"></div>
            <div className="card-content">
              <span className="card-sub">{suggestion.sub}</span>
              <h3 className="card-title">{suggestion.text}</h3>
              <div className="card-arrow">
                <ArrowRight size={16} />
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

export default QuickSuggestions;