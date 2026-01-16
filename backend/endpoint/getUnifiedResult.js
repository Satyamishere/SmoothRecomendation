import {flights} from '../mockData/mockdata.js';
import {hotels} from '../mockData/mockdata.js';
import {activities} from '../mockData/mockdata.js';
export function getUnifiedResult(req, res) {
  const intent = req.body;
  const results = [];


  for (const flight of flights) {
    for (const hotel of hotels) {

      // Check if we have duration
      if (!intent.duration_days) {
        console.log(`Skipping: No duration_days in intent`);
        continue;
      }

      const totalCost =
        flight.price +
        hotel.pricePerNight * intent.duration_days;

      

      if (
        intent.budget?.constraint_type === "hard" &&
        budgetMaxInCents &&
        totalCost > budgetMaxInCents
      ) {
        console.log(`Filtered out: ${totalCost}¢ > ${budgetMaxInCents}¢`);
        continue;
      }

      //score calculation
      let score = 100;

      // cheaper flights preferred
      if (intent.budget?.constraint_type !== "hard") {
        score -= flight.price / 1000;
      }

      // fewer stops preferred
      score -= flight.stops * 10;

      // connectivity preference
      if (
        intent.connectivity?.constraint_type === "soft" &&
        !hotel.nearMetro
      ) score -= 15;

      // interests preference
      intent.interests?.forEach(i => {
        const match = activities.some(
          a => a.tags.includes(i.type) && a.area === hotel.area
        );
        if (!match) score -= 10;
      });

      
      const selectedActivities = activities.filter(a =>
        intent.interests?.some(i => a.tags.includes(i.type))
      );

     

      results.push({
        flight,
        hotel,
        activities: selectedActivities,
        totalCost,
        score
      });
    }
  }

  console.log(`Total trips found: ${results.length}`);
  results.sort((a, b) => b.score - a.score);
  res.json({ status: 200, trips: results });
}