import flights from "../data/flights.js";
import hotels from "../data/hotels.js";
import activities from "../data/activities.js";


export function getUnifiedResult(intent) {
  const results = [];

  for (const flight of flights) {
    for (const hotel of hotels) {

      //hard budget constraint check
      const totalCost =
        flight.price +
        hotel.pricePerNight * intent.duration_days;

      if (
        intent.budget?.constraint_type === "hard" &&
        totalCost > intent.budget.max
      ) continue;

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

      results.push({
        flight,
        hotel,
        activities: selectedActivities,
        totalCost,
        score
      });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return res.json({ status: 200, trips: results});
}
