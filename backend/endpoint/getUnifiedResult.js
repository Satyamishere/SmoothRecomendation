// endpoint/getUnifiedResult.js
import { hotels, activities, flights as mockFlights } from '../mockData/mockdata.js';
import { searchFlights } from '../services/tektravelsService.js';

/**
 * STEP 1: Compute normalized weights from user intent
 * Maps constraint types to priorities and normalizes them
 */
function computeWeights(intent) {
  const priorities = {
    budget: 0,
    connectivity: 0,
    activity: 0,
    flight: 1, // Default priority for flight
    hotel: 1   // Default priority for hotel
  };

  // Map constraint types to priority values
  const constraintMap = {
    'hard': 3,
    'optimize': 2,
    'soft': 1,
    null: 0,
    undefined: 0
  };

  // Extract priorities from intent
  if (intent.budget) {
    priorities.budget = constraintMap[intent.budget.constraint_type] || 0;
  }

  if (intent.connectivity) {
    priorities.connectivity = constraintMap[intent.connectivity.constraint_type] || 0;
  }

  if (intent.interests && intent.interests.length > 0) {
    // Use the max constraint type priority from interests
    const maxInterestPriority = Math.max(
      ...intent.interests.map(i => constraintMap[i.constraint_type] || 0)
    );
    priorities.activity = maxInterestPriority;
  }

  // Calculate total priority
  const totalPriority = Object.values(priorities).reduce((sum, p) => sum + p, 0);

  // Normalize weights
  let weights = {};
  if (totalPriority === 0) {
    // Assign equal weights if all priorities are 0
    const equalWeight = 1 / 5;
    weights = {
      budget: equalWeight,
      flight: equalWeight,
      hotel: equalWeight,
      connectivity: equalWeight,
      activity: equalWeight
    };
  } else {
    // Normalize to sum to 1
    weights = {
      budget: priorities.budget / totalPriority,
      flight: priorities.flight / totalPriority,
      hotel: priorities.hotel / totalPriority,
      connectivity: priorities.connectivity / totalPriority,
      activity: priorities.activity / totalPriority
    };
  }

  console.log("📊 Computed weights:", {
    priorities,
    totalPriority,
    weights,
    sum: Object.values(weights).reduce((sum, w) => sum + w, 0)
  });

  return weights;
}

/**
 * STEP 2: Compute budget score (0-100 scale)
 */
function computeBudgetScore(totalCost, maxBudget) {
  if (!maxBudget) {
    return 50; // Neutral score if no budget specified
  }

  const budgetScore = 100 - (totalCost / maxBudget) * 100;
  return Math.max(0, Math.min(100, budgetScore)); // Clamp to 0-100
}

/**
 * STEP 2: Compute flight score (0-100 scale)
 */
function computeFlightScore(flight) {
  let score = 0;

  // Base score based on stops
  if (flight.stops === 0) {
    score = 100;
  } else if (flight.stops === 1) {
    score = 60;
  } else if (flight.stops === 2) {
    score = 30;
  } else {
    score = 0; // 3+ stops
  }

  // Optional: Adjust for flight timing (-10 to -20 max)
  // handle missing time gracefully
  const flightHour = parseInt((flight.time || '').split(':')[0]) || 0;
  if (flightHour >= 21 || flightHour <= 5) {
    score -= 15; // Bad timing penalty
  }

  return Math.max(0, Math.min(100, score)); // Clamp to 0-100
}

/**
 * STEP 2: Compute hotel score (0-100 scale)
 */
function computeHotelScore(hotel) {
  const score = (hotel.rating / 5) * 100;
  return Math.max(0, Math.min(100, score)); // Clamp to 0-100
}

/**
 * STEP 2: Compute connectivity score (0-100 scale)
 */
function computeConnectivityScore(hotel, connectivity) {
  if (!connectivity) {
    return 50; // Neutral if not specified
  }

  if (connectivity.value === "nearMetro" && hotel.nearMetro) {
    return 100;
  } else if (connectivity.value === "nearMetro") {
    return 30; // Penalty for not having metro access
  }

  return 50; // Neutral otherwise
}

/**
 * STEP 2: Compute activity score (0-100 scale)
 */
function computeActivityScore(matchedActivities, requestedInterests) {
  if (!requestedInterests || requestedInterests.length === 0) {
    return 50; // Neutral score if no interests specified
  }

  const matchRatio = matchedActivities.length / requestedInterests.length;
  const score = matchRatio * 100;
  return Math.max(0, Math.min(100, score)); // Clamp to 0-100
}

export async function getUnifiedResult(req, res) {
  const intent = req.body;
  const results = [];

  // Default duration if NLP fails to extract it
  const duration = intent.duration_days || 3;
  
  console.log("📊 Processing intent:", JSON.stringify(intent, null, 2));

  // STEP 1: Compute normalized weights from intent
  const weights = computeWeights(intent);

  // fetch flights from TekTravels (with fallback to mock data)
  let flights;
  try {
    flights = await searchFlights(intent);
    if (!flights || flights.length === 0) {
      throw new Error('no flights returned');
    }
  } catch (error) {
    console.error("Flight API failed, falling back to mock data", error.message);
    flights = mockFlights;
  }

  // STEP 2: Generate all possible trip combinations
  for (const flight of flights) {
    for (const hotel of hotels) {
      
      // Calculate base cost: flight + (hotel * nights)
      const hotelCost = hotel.pricePerNight * duration;
      let totalCost = flight.price + hotelCost;
      
      // Match activities based on user interests
      let matchedActivities = [];
      let activityCost = 0;
      
      if (intent.interests && intent.interests.length > 0) {
        // Find activities that match user's interests
        matchedActivities = activities.filter(activity => 
          intent.interests.some(userInterest => 
            activity.tags.some(tag => 
              tag.toLowerCase().includes(userInterest.type.toLowerCase()) ||
              userInterest.type.toLowerCase().includes(tag.toLowerCase())
            )
          )
        );
        
        // If no matches found, include 2 default activities
        if (matchedActivities.length === 0) {
          matchedActivities = activities.slice(0, 2);
        }
        
        // Limit to top 3 activities to keep cost reasonable
        matchedActivities = matchedActivities.slice(0, 3);
        
        // Add activity costs to total
        activityCost = matchedActivities.reduce((sum, act) => sum + act.price, 0);
        totalCost += activityCost;
      } else {
        // No specific interests - add 2 default activities
        matchedActivities = activities.slice(0, 2);
        activityCost = matchedActivities.reduce((sum, act) => sum + act.price, 0);
        totalCost += activityCost;
      }
      
      // STEP 3: Apply HARD constraints (filter out violating options)
      // Hard constraint filtering happens BEFORE scoring
      if (
        intent.budget?.constraint_type === "hard" && 
        intent.budget?.max && 
        totalCost > intent.budget.max
      ) {
        console.log(`❌ Filtered out: ${flight.airline} + ${hotel.name} (₹${totalCost} > ₹${intent.budget.max})`);
        continue; // Skip this combination - exceeds hard budget
      }

      if (intent.connectivity?.constraint_type === "hard" && 
          intent.connectivity?.value === "nearMetro" && 
          !hotel.nearMetro) {
        console.log(`❌ Filtered out: ${hotel.name} - no metro access (hard constraint)`);
        continue; // Skip this combination - violates hard connectivity constraint
      }

      // STEP 4: Compute normalized component scores (0-100 scale)
      const budgetScore = computeBudgetScore(totalCost, intent.budget?.max);
      const flightScore = computeFlightScore(flight);
      const hotelScore = computeHotelScore(hotel);
      const connectivityScore = computeConnectivityScore(hotel, intent.connectivity);
      const activityScore = computeActivityScore(matchedActivities, intent.interests);

      // STEP 5: Compute final weighted score
      const finalScore = 
        weights.budget * budgetScore +
        weights.flight * flightScore +
        weights.hotel * hotelScore +
        weights.connectivity * connectivityScore +
        weights.activity * activityScore;

      // Round and clamp to 40-95 range for UI display
      const displayScore = Math.max(40, Math.min(95, Math.round(finalScore)));

      // STEP 6: Build explainable result object
      results.push({
        id: `trip_${flight.airline.replace(/\s+/g, '')}_${hotel.name.replace(/\s+/g, '')}_${Date.now()}`,
        destination: intent.destination || "Your Destination",
        duration: duration,
        totalCost: Math.round(totalCost),
        breakdown: {
          flight: flight.price,
          hotel: hotelCost,
          activities: activityCost
        },
        score: displayScore, // Match percentage shown to user (40-95 range)
        scoreBreakdown: {
          weights: weights,
          componentScores: {
            budgetScore: Math.round(budgetScore * 100) / 100,
            flightScore: Math.round(flightScore * 100) / 100,
            hotelScore: Math.round(hotelScore * 100) / 100,
            connectivityScore: Math.round(connectivityScore * 100) / 100,
            activityScore: Math.round(activityScore * 100) / 100
          },
          rawScore: Math.round(finalScore * 100) / 100
        },
        flight: {
          airline: flight.airline,
          price: flight.price,
          stops: flight.stops,
          time: flight.time
        },
        hotel: {
          name: hotel.name,
          pricePerNight: hotel.pricePerNight,
          rating: hotel.rating,
          nearMetro: hotel.nearMetro,
          image: hotel.image
        },
        activities: matchedActivities.map(act => ({
          name: act.name,
          tags: act.tags,
          price: act.price
        }))
      });
    }
  }

  // STEP 7: Sort by final score (highest first)
  results.sort((a, b) => b.score - a.score);

  console.log(`\n✅ Generated ${results.length} trip options`);
  console.log(`📊 Score range: ${results[results.length-1]?.score} - ${results[0]?.score}`);
  console.log(`📊 Top 5 scores: ${results.slice(0, 5).map(r => `${r.score}%`).join(', ')}`);

  // Return top 6 recommendations
  const topResults = results.slice(0, 6);

  res.json({ 
    status: 200,
    query: {
      destination: intent.destination,
      duration: duration,
      budget: intent.budget?.max ? `₹${intent.budget.max}` : "Not specified",
      interests: intent.interests?.map(i => i.type) || []
    },
    trips: topResults,
    totalOptions: results.length
  });
}