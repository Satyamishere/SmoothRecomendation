// mockData/mockdata.js

export const flights = [
  { 
    airline: "IndiGo", 
    price: 8500, 
    stops: 0, 
    time: "10:00 AM",
    duration: "2h 15m"
  },
  { 
    airline: "Air India", 
    price: 12000, 
    stops: 0, 
    time: "06:00 PM",
    duration: "2h 30m"
  },
  { 
    airline: "SpiceJet", 
    price: 6500, 
    stops: 1, 
    time: "11:00 PM",
    duration: "4h 45m"
  },
  { 
    airline: "Vistara", 
    price: 10500, 
    stops: 0, 
    time: "07:30 AM",
    duration: "2h 20m"
  },
  { 
    airline: "Go First", 
    price: 7200, 
    stops: 1, 
    time: "03:00 PM",
    duration: "5h 10m"
  }
];

export const hotels = [
  { 
    name: "Beachside Hostel", 
    pricePerNight: 1200, 
    nearMetro: true, 
    rating: 4.2,
    amenities: ["WiFi", "Breakfast", "Pool"],
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80" 
  },
  { 
    name: "Urban Stay Inn", 
    pricePerNight: 3500, 
    nearMetro: true, 
    rating: 4.5,
    amenities: ["WiFi", "Breakfast", "Gym", "Restaurant"],
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80" 
  },
  { 
    name: "Luxury Palms Resort", 
    pricePerNight: 15000, 
    nearMetro: false, 
    rating: 5.0,
    amenities: ["WiFi", "Breakfast", "Pool", "Spa", "Beach Access"],
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80" 
  },
  { 
    name: "Coastal Comfort Hotel", 
    pricePerNight: 5500, 
    nearMetro: false, 
    rating: 4.3,
    amenities: ["WiFi", "Breakfast", "Pool"],
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80" 
  },
  { 
    name: "Budget Traveler's Inn", 
    pricePerNight: 1800, 
    nearMetro: true, 
    rating: 3.8,
    amenities: ["WiFi", "Basic Breakfast"],
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80" 
  },
  { 
    name: "Heritage Bay Resort", 
    pricePerNight: 8500, 
    nearMetro: false, 
    rating: 4.7,
    amenities: ["WiFi", "Breakfast", "Pool", "Restaurant", "Cultural Tours"],
    image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80" 
  }
];

export const activities = [
  { 
    name: "Scuba Diving", 
    tags: ["adventure", "water", "sports"], 
    price: 3000,
    duration: "3-4 hours",
    description: "Explore underwater marine life"
  },
  { 
    name: "Old Goa Heritage Walk", 
    tags: ["culture", "history", "sightseeing"], 
    price: 500,
    duration: "2-3 hours",
    description: "Guided tour of historical churches and monuments"
  },
  { 
    name: "Night Market Experience", 
    tags: ["shopping", "food", "culture"], 
    price: 0,
    duration: "2-3 hours",
    description: "Browse local crafts and try street food"
  },
  { 
    name: "Parasailing", 
    tags: ["adventure", "water", "sports"], 
    price: 2500,
    duration: "1-2 hours",
    description: "Soar above the beaches with ocean views"
  },
  { 
    name: "Sunset Cruise", 
    tags: ["romantic", "water", "relaxation"], 
    price: 1500,
    duration: "2 hours",
    description: "Evening boat ride with dinner"
  },
  { 
    name: "Spice Plantation Tour", 
    tags: ["nature", "culture", "food"], 
    price: 800,
    duration: "4-5 hours",
    description: "Learn about local spices and enjoy traditional lunch"
  },
  { 
    name: "Beach Yoga Session", 
    tags: ["wellness", "relaxation", "fitness"], 
    price: 600,
    duration: "1 hour",
    description: "Morning yoga on the beach"
  },
  { 
    name: "Water Sports Package", 
    tags: ["adventure", "water", "sports"], 
    price: 4500,
    duration: "Full day",
    description: "Jet skiing, banana boat, and more"
  },
  { 
    name: "Cooking Class", 
    tags: ["food", "culture", "learning"], 
    price: 2000,
    duration: "3-4 hours",
    description: "Learn to cook authentic Goan cuisine"
  },
  { 
    name: "Dudhsagar Waterfall Trek", 
    tags: ["adventure", "nature", "hiking"], 
    price: 1800,
    duration: "Full day",
    description: "Trek through jungle to majestic waterfalls"
  }
];

// You can also add destination-specific data for future scaling
export const destinations = {
  "Goa": {
    bestMonths: ["November", "December", "January", "February"],
    weather: "Tropical",
    timezone: "IST",
    currency: "INR"
  },
  "Jaipur": {
    bestMonths: ["October", "November", "February", "March"],
    weather: "Semi-arid",
    timezone: "IST",
    currency: "INR"
  }
  // Add more destinations as you scale
};