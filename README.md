# Travel Recommendation Scoring Engine

## What it does
Takes user travel requests and returns ranked trip recommendations with flights, hotels, and activities.

## How scoring works

Weights are computed from user intent:
- hard constraint = weight 3
- optimize = weight 2
- soft = weight 1
- not mentioned = weight 0

Weights are normalized to sum to 1.0. If no constraints given, all 5 factors get 0.2.

Each component scores 0-100:

Budget
- With max budget: 100 - (totalCost / maxBudget) * 100
- No budget: 50

Flight
- 0 stops = 100
- 1 stop = 60
- 2 stops = 30
- Night flights (21:00-05:00): -15

Hotel
- (rating / 5) * 100

Connectivity
- Requested metro + has metro = 100
- Requested metro + no metro = 30
- Not requested = 50

Activity
- (matched activities / requested interests) * 100
- No interests = 50

Final score = sum(weight * component score)

Hard constraints filter out results before scoring:
- Budget hard and cost > max = skip
- Connectivity hard and no metro = skip

## Intent extraction

Uses Groq LLM to parse natural language into structured intent:
- destination
- duration (default 3 days)
- budget with constraint type
- connectivity with constraint type
- interests with constraint types
- mood

Returns JSON only.

## Embedding matching

Activities and user interests/moods are converted to vector embeddings using Xenova/all-MiniLM-L6-v2. Cosine similarity ranks activities. Top 3 similar activities per destination are recommended.

## Files

- backend/endpoint/getUnifiedResult.js - main scoring logic
- backend/oneTimeCallFunctions/intentExtractor.js - LLM intent parsing
- backend/oneTimeCallFunctions/getembedding.js - vector embeddings

## Flow

1. User inputs text
2. LLM extracts intent with constraint types
3. Generate embedding from text + mood + interests
4. Compute weights from intent
5. Fetch flights (API or mock)
6. For each flight-hotel pair:
   - Match activities via cosine similarity
   - Calculate total cost
   - Apply hard filters
   - Compute 5 component scores
   - Calculate weighted final score
7. Sort by score descending
8. Return top 6 results

## Response includes

- destination, duration, total cost
- score (40-95 range for UI)
- scoreBreakdown with weights and component scores
- flight details
- hotel details
- matched activities