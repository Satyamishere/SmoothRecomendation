import Groq from "groq-sdk";
import dotenv from 'dotenv';

dotenv.config();

console.log("=== GROQ CONFIG ===");
console.log("API Key loaded:", !!process.env.GROQ_API_KEY);
console.log("===================");

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
Extract travel intent from: "${text}"
Return JSON with: destination, duration_days, month, budget (max, constraint_type), connectivity (value, constraint_type), interests array.
Constraint types: "hard" for must/under, "optimize" for cheapest, "soft" for preferences.

IMPORTANT: interests should be array of objects: [{"type": "interest_name", "constraint_type": "hard/soft"}]
Return ONLY JSON.
`;

  for (const model of WORKING_MODELS) {
    try {
      console.log(`🤖 Trying model: ${model}`);
      
      const response = await groq.chat.completions.create({
        model: model,
        messages: [
          { 
            role: "system", 
            content: "Extract travel intent. Return valid JSON only. No explanations." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      const generated = response.choices[0].message.content;
      console.log(`✅ ${model} SUCCESS! Output:`, generated);

      // Parse the JSON
      let jsonStr = generated.trim();
      
      // Clean markdown
      if (jsonStr.includes('```json')) {
        jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
      } else if (jsonStr.includes('```')) {
        jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
      }
      
      const intent = JSON.parse(jsonStr);
      
      // FIX: Convert interests format if needed
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
      
      // Validate structure
      if (!intent.budget) intent.budget = { max: null, constraint_type: null };
      if (!intent.connectivity) intent.connectivity = { value: null, constraint_type: null };
      if (!intent.interests) intent.interests = [];
      
      console.log("Parsed intent:", JSON.stringify(intent, null, 2));
      
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