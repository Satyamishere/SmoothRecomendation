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

      // FIX: Convert budget from dollars to cents for comparison
      const budgetMaxInCents = intent.budget?.max ? intent.budget.max * 100 : null;

      console.log(`Checking: Flight ${flight.airline} (${flight.price}¢) + Hotel ${hotel.name} (${hotel.pricePerNight}¢ x ${intent.duration_days}) = ${totalCost}¢`);
      console.log(`Budget: ${budgetMaxInCents}¢ (${intent.budget?.max}$)`);

      if (
        intent.budget?.constraint_type === "hard" &&
        budgetMaxInCents &&
        totalCost > budgetMaxInCents
      ) {
        console.log(`❌ Filtered out: ${totalCost}¢ > ${budgetMaxInCents}¢`);
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

      /* ---- SELECT ACTIVITIES ---- */
      const selectedActivities = activities.filter(a =>
        intent.interests?.some(i => a.tags.includes(i.type))
      );

      console.log(`✅ Added: Score ${score}, Activities: ${selectedActivities.length}`);

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