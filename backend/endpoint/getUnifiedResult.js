// endpoint/getUnifiedResult.js
import { flights, hotels, activities } from '../mockData/mockdata.js';

export function getUnifiedResult(req, res) {
  const intent = req.body;
  const results = [];

  // Default duration if NLP fails to extract it
  const duration = intent.duration_days || 3;
  
  console.log("📊 Processing intent:", JSON.stringify(intent, null, 2));

  // STEP 1: Generate all possible trip combinations
  for (const flight of flights) {
    for (const hotel of hotels) {
      
      // Calculate base cost: flight + (hotel * nights)
      const hotelCost = hotel.pricePerNight * duration;
      let totalCost = flight.price + hotelCost;
      
      // STEP 2: Match activities based on user interests
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
      
      // STEP 3: Apply HARD budget constraint (filter out expensive options)
      if (
        intent.budget?.constraint_type === "hard" && 
        intent.budget?.max && 
        totalCost > intent.budget.max
      ) {
        console.log(`❌ Filtered out: ${flight.airline} + ${hotel.name} (₹${totalCost} > ₹${intent.budget.max})`);
        continue; // Skip this combination - exceeds hard budget
      }

      // STEP 4: Smart Ranking Engine - Calculate Match Score (Start from 50 for realistic distribution)
      let score = 50;
      let scoreBreakdown = {
        base: 50,
        adjustments: []
      };

      // A) Budget Optimization (Most Important Factor - up to ±30 points)
      if (intent.budget?.max) {
        const budgetUsage = (totalCost / intent.budget.max) * 100;
        
        if (intent.budget.constraint_type === "optimize") {
          // Reward cheaper options significantly
          const budgetScore = Math.max(0, (100 - budgetUsage) * 0.4);
          score += budgetScore;
          scoreBreakdown.adjustments.push({
            factor: "Budget Optimization",
            impact: `+${budgetScore.toFixed(1)}`,
            reason: `Using only ${budgetUsage.toFixed(0)}% of budget`
          });
        } else if (budgetUsage > 95) {
          // Very close to budget limit - penalty
          const budgetPenalty = (budgetUsage - 95) * 2;
          score -= budgetPenalty;
          scoreBreakdown.adjustments.push({
            factor: "Budget Stretch",
            impact: `-${budgetPenalty.toFixed(1)}`,
            reason: `${budgetUsage.toFixed(0)}% of budget used`
          });
        } else if (budgetUsage < 70) {
          // Well within budget - bonus
          const budgetBonus = (70 - budgetUsage) * 0.3;
          score += budgetBonus;
          scoreBreakdown.adjustments.push({
            factor: "Budget Comfort",
            impact: `+${budgetBonus.toFixed(1)}`,
            reason: `Only ${budgetUsage.toFixed(0)}% of budget used`
          });
        }
      } else {
        // No budget specified - favor mid-range options
        if (totalCost < 15000) {
          score += 10;
          scoreBreakdown.adjustments.push({
            factor: "Value Option",
            impact: "+10",
            reason: "Affordable pricing"
          });
        } else if (totalCost > 40000) {
          score -= 15;
          scoreBreakdown.adjustments.push({
            factor: "Premium Pricing",
            impact: "-15",
            reason: "High-end option"
          });
        }
      }

      // B) Flight Convenience Score (up to ±18 points)
      if (flight.stops === 0) {
        score += 18;
        scoreBreakdown.adjustments.push({
          factor: "Direct Flight",
          impact: "+18",
          reason: "Non-stop convenience"
        });
      } else {
        const stopsPenalty = flight.stops * 15;
        score -= stopsPenalty;
        scoreBreakdown.adjustments.push({
          factor: "Flight Stops",
          impact: `-${stopsPenalty}`,
          reason: `${flight.stops} layover(s)`
        });
      }

      // C) Connectivity Preference (up to ±25 points)
      if (intent.connectivity?.value === "nearMetro") {
        if (hotel.nearMetro) {
          const connectivityBonus = intent.connectivity.constraint_type === "hard" ? 25 : 15;
          score += connectivityBonus;
          scoreBreakdown.adjustments.push({
            factor: "Metro Access",
            impact: `+${connectivityBonus}`,
            reason: "Hotel near metro station"
          });
        } else if (intent.connectivity.constraint_type === "hard") {
          // Hard constraint violated - skip this option
          console.log(`❌ Filtered out: ${hotel.name} - no metro access (hard constraint)`);
          continue;
        } else {
          // Soft constraint - significant penalty
          score -= 20;
          scoreBreakdown.adjustments.push({
            factor: "Metro Access",
            impact: "-20",
            reason: "No nearby metro access"
          });
        }
      }

      // D) Hotel Rating Quality (up to +15 points)
      const ratingBonus = (hotel.rating - 4.0) * 15;
      score += ratingBonus;
      scoreBreakdown.adjustments.push({
        factor: "Hotel Quality",
        impact: ratingBonus >= 0 ? `+${ratingBonus.toFixed(1)}` : `${ratingBonus.toFixed(1)}`,
        reason: `${hotel.rating}★ rated property`
      });

      // E) Activity Match Score (up to +20 points)
      if (intent.interests && intent.interests.length > 0) {
        const matchPercentage = (matchedActivities.length / intent.interests.length) * 100;
        const activityBonus = Math.min(20, matchPercentage * 0.2);
        score += activityBonus;
        scoreBreakdown.adjustments.push({
          factor: "Interest Matching",
          impact: `+${activityBonus.toFixed(1)}`,
          reason: `${matchedActivities.length} activities match your interests`
        });
      } else {
        // No interests specified - small bonus for variety
        score += 5;
        scoreBreakdown.adjustments.push({
          factor: "Activity Variety",
          impact: "+5",
          reason: "Curated activity selection"
        });
      }

      // F) Value for Money Score (balance between cost and quality)
      const valueRatio = (hotel.rating * 20) / (totalCost / 1000);
      if (valueRatio > 1.2) {
        score += 8;
        scoreBreakdown.adjustments.push({
          factor: "Great Value",
          impact: "+8",
          reason: "Excellent quality-to-price ratio"
        });
      } else if (valueRatio < 0.6) {
        score -= 8;
        scoreBreakdown.adjustments.push({
          factor: "Value Concern",
          impact: "-8",
          reason: "Premium pricing for quality offered"
        });
      }

      // G) Flight Timing Preference (small bonus for convenient times)
      const flightHour = parseInt(flight.time.split(':')[0]);
      if (flightHour >= 6 && flightHour <= 10) {
        score += 5;
        scoreBreakdown.adjustments.push({
          factor: "Morning Flight",
          impact: "+5",
          reason: "Convenient departure time"
        });
      } else if (flightHour >= 21 || flightHour <= 5) {
        score -= 5;
        scoreBreakdown.adjustments.push({
          factor: "Late/Early Flight",
          impact: "-5",
          reason: "Inconvenient departure time"
        });
      }

      // Normalize score to 40-95 range (more realistic distribution)
      score = Math.max(40, Math.min(95, Math.round(score)));

      // STEP 5: Build result object with transparency
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
        score: score, // Match percentage shown to user (40-95 range)
        scoreBreakdown: scoreBreakdown, // Transparent explanation
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

  // STEP 6: Sort by match score (highest first) - Smart Ranking
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