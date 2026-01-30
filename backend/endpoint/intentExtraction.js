import Groq from "groq-sdk";
import dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const WORKING_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant"
];

export async function extractIntent(req, res, next) {
  const text = req.body?.text;
  
  if (!text) {
    return res.status(400).json({ error: "Missing 'text' in request body" });
  }

  console.log(`🔍 Extracting intent from: "${text}"`);

  const prompt = `
You are a smart travel assistant. Extract travel intent from user's natural language query.

User Query: "${text}"

INSTRUCTIONS:
1. If user mentions a specific place (Goa, Delhi, Kerala, etc.) → use that as destination
2. If user expresses a mood/feeling WITHOUT a place:
   - "peaceful/calm/relaxation" → suggest "Rishikesh"
   - "adventure/thrill" → suggest "Leh-Ladakh"
   - "romantic/couple" → suggest "Udaipur"
   - "beach/coastal" → suggest "Goa"
   - "party/nightlife" → suggest "Goa"
   - "spiritual/religious" → suggest "Varanasi"
   - "nature/mountains" → suggest "Manali"
   - "culture/heritage" → suggest "Jaipur"

3. Extract interests from mood/activities mentioned
4. If duration not mentioned, assume 3 days
5. If budget not mentioned, leave as null

Return JSON ONLY with this structure:
{
  "destination": "City Name or null",
  "duration_days": 3,
  "month": "optional month name",
  "budget": {
    "max": number or null,
    "constraint_type": "hard" | "soft" | "optimize" | null
  },
  "connectivity": {
    "value": "nearMetro" | null,
    "constraint_type": "hard" | "soft" | null
  },
  "interests": [
    {"type": "peaceful", "constraint_type": "soft"},
    {"type": "beach", "constraint_type": "soft"}
  ]
}

EXAMPLES:
Input: "Plan a 3-day trip to Goa under 20k"
Output: {"destination": "Goa", "duration_days": 3, "budget": {"max": 20000, "constraint_type": "hard"}, "connectivity": null, "interests": []}

Input: "I'm feeling peaceful"
Output: {"destination": "Rishikesh", "duration_days": 3, "budget": null, "connectivity": null, "interests": [{"type": "peaceful", "constraint_type": "soft"}, {"type": "relaxation", "constraint_type": "soft"}]}

Input: "Suggest something adventurous"
Output: {"destination": "Leh-Ladakh", "duration_days": 3, "budget": null, "connectivity": null, "interests": [{"type": "adventure", "constraint_type": "soft"}]}

Now extract from: "${text}"
Return ONLY valid JSON.
`;

  for (const model of WORKING_MODELS) {
    try {
      console.log(`Trying model: ${model}`);
      
      const response = await groq.chat.completions.create({
        model: model,
        messages: [
          { 
            role: "system", 
            content: "You are a travel intent extraction AI. Return ONLY valid JSON. No explanations, no markdown." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      const generated = response.choices[0].message.content;
      
      // Parse the JSON
      let jsonStr = generated.trim();
      
      // Clean markdown if present
      if (jsonStr.includes('```json')) {
        jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
      } else if (jsonStr.includes('```')) {
        jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
      }
      
      const intent = JSON.parse(jsonStr);
      
      // Post-processing: ensure proper structure
      if (Array.isArray(intent.interests)) {
        intent.interests = intent.interests.map(item => {
          if (typeof item === 'string') {
            return {
              type: item,
              constraint_type: "soft"
            };
          }
          return item;
        });
      }
      
      // Set defaults for missing fields
      if (!intent.budget) intent.budget = { max: null, constraint_type: null };
      if (!intent.connectivity) intent.connectivity = { value: null, constraint_type: null };
      if (!intent.interests) intent.interests = [];
      if (!intent.duration_days) intent.duration_days = 3;
      
      console.log(`✅ Extracted Intent:`, JSON.stringify(intent, null, 2));
      
      req.body = intent;
      return next();
      
    } catch (err) {
      console.log(`${model} failed:`, err.message);
    }
  }

  res.status(500).json({
    error: "Intent extraction failed",
    details: "All Groq API models failed"
  });
}