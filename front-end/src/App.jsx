import React, { useState } from 'react';
import { Sparkles, Calendar, ArrowRight, Loader2, Plane, Hotel, Star, MapPin, TrendingUp, Clock, Zap, Heart } from 'lucide-react';
import './App.css';

function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('http://localhost:5000/getHolidayOptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query })
      });

      const data = await response.json();
      
      if (data.trips && data.trips.length > 0) {
        setResults(data.trips);
      } else {
        setError("No trips found matching your criteria. Try adjusting your budget or preferences!");
      }
    } catch (err) {
      setError("Unable to connect to the backend. Please ensure the server is running on port 5000.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Zap, text: 'AI-Powered Matching' },
    { icon: Clock, text: 'Instant Results' },
    { icon: TrendingUp, text: 'Smart Ranking' },
    { icon: Heart, text: 'Personalized' }
  ];

  return (
    <div className="app-wrapper">
      {/* Animated background elements */}
      <div className="bg-blobs">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="app-container">
        {/* Header Section */}
        <div className={`hero-section ${results ? 'compact' : 'full'}`}>
          {/* Brand */}
          <div className="brand-header">
            <div className="brand-icon-wrapper">
              <Sparkles className="brand-icon" />
              <div className="brand-icon-glow"></div>
            </div>
            <h1 className="brand-title">TravelGenie</h1>
          </div>

          {/* Hero Title */}
          <h2 className={`hero-title ${results ? 'small' : 'large'}`}>
            {results ? (
              <span className="gradient-text">Your Perfect Trips Await ✨</span>
            ) : (
              <>
                <span className="title-line">Where is your</span>
                <span className="gradient-text-multi">next adventure?</span>
              </>
            )}
          </h2>

          {/* Search Bar */}
          <div className="search-wrapper">
            <div className="search-container">
              <div className="search-glow"></div>
              <div className="search-bar">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Try: 3-day romantic trip to Goa under ₹25,000 with beach activities..."
                  className="search-input"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="search-button"
                >
                  {loading ? (
                    <Loader2 className="button-icon spin" />
                  ) : (
                    <ArrowRight className="button-icon" />
                  )}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </div>

          {/* Feature Pills */}
          {!results && !loading && (
            <div className="features-container">
              {features.map((feature, i) => (
                <div key={i} className="feature-pill">
                  <feature.icon className="feature-icon" />
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Results Grid */}
        {results && (
          <div className="results-grid">
            {results.map((trip, index) => (
              <div
                key={trip.id || index}
                className="trip-card"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Card Image */}
                <div className="card-image-wrapper">
                  <div
                    className="card-image"
                    style={{ backgroundImage: `url(${trip.hotel?.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'})` }}
                  >
                    <div className="card-image-overlay"></div>
                  </div>
                  
                  {/* Match Badge */}
                  <div className={`match-badge ${
                    trip.score >= 85 ? 'excellent' : 
                    trip.score >= 70 ? 'good' : 
                    trip.score >= 55 ? 'fair' : 'low'
                  }`}>
                    <Star className="match-star" />
                    {trip.score}% Match
                  </div>

                  {/* Destination */}
                  <div className="destination-label">
                    <MapPin className="destination-icon" />
                    <h3 className="destination-name">{trip.destination}</h3>
                  </div>
                </div>

                {/* Card Content */}
                <div className="card-content">
                  {/* Price & Duration */}
                  <div className="card-header">
                    <div className="trip-price">
                      ₹{trip.totalCost?.toLocaleString() || '0'}
                    </div>
                    <div className="trip-duration">
                      <Calendar className="duration-icon" />
                      <span>{trip.duration} Days</span>
                    </div>
                  </div>

                  {/* Flight Info */}
                  <div className="info-card">
                    <div className="info-card-inner">
                      <div className="info-icon-box blue">
                        <Plane className="info-icon" />
                      </div>
                      <div className="info-content">
                        <p className="info-title">{trip.flight?.airline || 'Flight'}</p>
                        <p className="info-subtitle">
                          {trip.flight?.time || 'Departure time'} • {trip.flight?.stops === 0 ? 'Non-stop' : `${trip.flight?.stops} Stop`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Hotel Info */}
                  <div className="info-card">
                    <div className="info-card-inner">
                      <div className="info-icon-box purple">
                        <Hotel className="info-icon" />
                      </div>
                      <div className="info-content">
                        <div className="info-header">
                          <p className="info-title">{trip.hotel?.name || 'Hotel'}</p>
                          <div className="rating">
                            <Star className="rating-star" />
                            <span className="rating-text">{trip.hotel?.rating || '4.5'}</span>
                          </div>
                        </div>
                        <p className="info-subtitle">
                          {trip.hotel?.nearMetro ? '🚇 Near Metro' : '📍 Prime Location'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Activities */}
                  {trip.activities && trip.activities.length > 0 && (
                    <div className="activities-section">
                      <p className="activities-label">Included Activities:</p>
                      <div className="activities-tags">
                        {trip.activities.slice(0, 3).map((act, i) => (
                          <span key={i} className="activity-tag">
                            {act.name || act}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Book Button */}
                  <button className="book-button">
                    View Full Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner-wrapper">
              <Loader2 className="loading-spinner" />
              <div className="loading-spinner-glow"></div>
            </div>
            <p className="loading-text">Finding your perfect trips...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;