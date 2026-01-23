import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Calendar, Wallet, TrendingUp, 
  Plane, Hotel, Star, Coffee,
  CheckCircle2, Clock, ChevronDown, Sparkles
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import './TripCard.css';

const TripCard = ({ trip }) => {
  const [expandedDay, setExpandedDay] = useState(1);

  // Neon Palette for Charts
  const CHART_COLORS = ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#64748B'];

  const budgetData = [
    { name: 'Transport', value: trip.budget.allocated.transport },
    { name: 'Stay', value: trip.budget.allocated.accommodation },
    { name: 'Activities', value: trip.budget.allocated.activities },
    { name: 'Food', value: trip.budget.allocated.food },
    { name: 'Misc', value: trip.budget.allocated.miscellaneous }
  ];

  const formatCurrency = (amount) => `₹${(amount / 1000).toFixed(1)}k`;

  const getActivityIcon = (type) => {
    switch (type) {
      case 'flight': return <Plane size={14} />;
      case 'hotel': return <Hotel size={14} />;
      case 'activity': return <Star size={14} />;
      case 'meal': return <Coffee size={14} />;
      default: return <Clock size={14} />;
    }
  };

  return (
    <motion.div 
      className="trip-card"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* 1. Destination Header */}
      <div className="trip-header">
        <motion.div 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
        >
          <h2 className="trip-destination">
            <MapPin className="destination-icon" size={28} />
            {trip.destination.primary}
          </h2>
          <div className="trip-badges">
            <span className="badge">
              <Calendar className="badge-icon" />
              {trip.duration} Days
            </span>
            <span className="badge success">
              <Sparkles className="badge-icon" />
              {trip.optimization.score}% Match
            </span>
          </div>
        </motion.div>
      </div>

      {/* 2. Smart Budget Section */}
      <div className="budget-section">
        <h3 className="section-title">
          <Wallet size={18} className="text-primary" /> 
          Smart Budget
        </h3>
        
        <div className="budget-summary">
          <div className="budget-item">
            <span className="budget-label">Total</span>
            <span className="budget-value">{formatCurrency(trip.budget.total)}</span>
          </div>
          <div className="budget-item">
            <span className="budget-label">Daily Avg</span>
            <span className="budget-value">{formatCurrency(trip.budget.total / trip.duration)}</span>
          </div>
          <div className="budget-item">
            <span className="budget-label">Savings</span>
            <span className="budget-value highlight">{formatCurrency(trip.budget.remaining)}</span>
          </div>
        </div>

        <div className="budget-chart">
          <div style={{ height: 180, position: 'relative' }}>
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {budgetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ 
                    background: 'rgba(15, 23, 42, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Label for Chart */}
            <div style={{
                position: 'absolute', top: '50%', left: '50%', 
                transform: 'translate(-50%, -50%)', textAlign: 'center'
            }}>
                <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Spent</span>
                <div style={{ fontWeight: 'bold', color: 'white' }}>{formatCurrency(trip.budget.spent)}</div>
            </div>
          </div>
          
          <div className="budget-legend">
            {budgetData.map((item, index) => (
              <div key={index} className="legend-item">
                <div className="legend-left">
                    <div 
                      className="legend-color" 
                      style={{ 
                        backgroundColor: CHART_COLORS[index],
                        boxShadow: `0 0 8px ${CHART_COLORS[index]}`
                      }}
                    />
                    <span style={{ color: '#E2E8F0' }}>{item.name}</span>
                </div>
                <span style={{ fontWeight: 600, color: '#F8FAFC' }}>{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Itinerary Section */}
      <div className="itinerary-section">
        <h3 className="section-title">
          <TrendingUp size={18} className="text-primary" />
          Itinerary
        </h3>
        
        <div className="itinerary-list">
          {trip.itinerary.map((day) => (
            <motion.div 
              key={day.day}
              className={`day-card ${expandedDay === day.day ? 'expanded' : ''}`}
            >
              <div 
                className="day-header"
                onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
              >
                <div className="day-info">
                  <span className="day-number">Day {day.day}</span>
                  <span className="day-items-count">
                    {day.items.length} Plans
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: expandedDay === day.day ? 180 : 0 }}
                >
                    <ChevronDown size={18} className="text-muted" />
                </motion.div>
              </div>

              <AnimatePresence>
                {expandedDay === day.day && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="day-content"
                  >
                    {day.items.map((item, index) => (
                      <div key={index} className="activity-item">
                        <div className="activity-icon-wrapper">
                            {getActivityIcon(item.type)}
                        </div>
                        <div className="activity-details">
                          <div className="activity-name">{item.name}</div>
                          <div className="activity-meta">
                            <span className="activity-time">{item.time}</span>
                            {item.cost > 0 && (
                              <span className="activity-cost">
                                {formatCurrency(item.cost)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 4. Sticky Bottom Actions */}
      <div className="trip-actions">
        <motion.button 
          className="action-button primary"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <CheckCircle2 size={18} />
          Confirm Booking
        </motion.button>
        <motion.button 
          className="action-button secondary"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Modify Plan
        </motion.button>
      </div>
    </motion.div>
  );
};

export default TripCard;