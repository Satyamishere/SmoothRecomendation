

const HF_MODEL_API ="https://api-inference.huggingface.co/models/google/flan-t5-base";
  

export async function extractIntent(req, res) {
    const text=req.body.text
const prompt = `
You are an intent extraction system for travel search.

Your tasks:
1. Extract structured intent from the text.
2. Determine constraint strength based on language.

Rules for constraint_type:
- Use "hard" if the user specifies a strict limit
  (e.g. "under", "at most", "must", "only", "not above")
- Use "optimize" if the user expresses cost or priority optimization
  (e.g. "cheapest", "lowest cost", "as cheap as possible")
- Use "soft" if the user expresses a preference
  (e.g. "with", "prefer", "good", "nice to have")
- Use null if not mentioned.

Return ONLY valid JSON.
Do not include explanations.

Schema:
{
  "destination": string | null,
  "duration_days": number | null,
  "month": string | null,

  "budget": {
    "max": number | null,
    "constraint_type": "hard" | "soft" | "optimize" | null
  },

  "connectivity": {
    "value": string | null,
    "constraint_type": "hard" | "soft" | null
  },

  "interests": [
    {
      "type": string,
      "constraint_type": "hard" | "soft" | null
    }
  ]
}

Text:
"${text}"
`;


  const response = await fetch(HF_MODEL_API, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.HF_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        temperature: 0,
        max_new_tokens: 200
      }
    })
  });

  const result = await response.json();

  const finalResult = result[0].generated_text;
  req.finalResult=finalResult;
  next();
  //res.json({status:200, intent: finalResult });
}
