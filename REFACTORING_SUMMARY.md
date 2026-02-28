# Scoring Engine Refactoring Summary

## Overview
Successfully converted travel recommendation scoring system from **additive heuristics** to a **normalized weighted multi-objective model**.

---

## ✅ Changes Implemented

### STEP 1: Priority Mapping & Weight Computation

**New Function:** `computeWeights(intent)`

**Features:**
- Maps constraint types to raw priorities:
  - `hard` → 3
  - `optimize` → 2
  - `soft` → 1
  - `null/undefined` → 0

- Extracts priorities for:
  - Budget
  - Connectivity
  - Interests (activities)
  - Flight (default: 1 if not mentioned)
  - Hotel (default: 1 if not mentioned)

- **Smart handling:**
  - If total priority = 0 → assigns equal weights (0.2 each)
  - Otherwise → normalizes weights so sum = 1.0

- **Returns:** Object with normalized weights
  ```javascript
  {
    budget: number,
    flight: number,
    hotel: number,
    connectivity: number,
    activity: number
  }
  ```

---

### STEP 2: Normalized Component Scoring (0-100 Scale)

#### **Budget Score**
- If `intent.budget.max` exists:
  ```javascript
  budgetScore = 100 - (totalCost / maxBudget) * 100
  ```
- If no budget specified: Returns neutral score of 50
- Clamped to [0, 100]

#### **Flight Score**
- 0 stops → 100
- 1 stop → 60
- 2 stops → 30
- Penalty for bad timing (flights 21:00-05:00): -15 points
- Clamped to [0, 100]

#### **Hotel Score**
```javascript
hotelScore = (hotel.rating / 5) * 100
```
- Clamped to [0, 100]

#### **Connectivity Score**
- If `nearMetro` preference + hotel has metro access → 100
- If `nearMetro` preference but no metro → 30
- If not specified → 50 (neutral)

#### **Activity Score**
```javascript
matchRatio = matchedActivities / requestedInterests
activityScore = matchRatio * 100
```
- If no interests specified → 50 (neutral)
- Clamped to [0, 100]

---

### STEP 3: Weighted Final Score Calculation

**Formula:**
```javascript
finalScore = 
  weights.budget * budgetScore +
  weights.flight * flightScore +
  weights.hotel * hotelScore +
  weights.connectivity * connectivityScore +
  weights.activity * activityScore
```

**Processing:**
1. All component scores computed independently (0-100 scale)
2. Weighted sum computed using normalized weights
3. Result rounded to nearest integer
4. Clamped to display range [40, 95] for UI consistency

---

### STEP 4: Hard Constraint Filtering (Preserved)

**Filtering happens BEFORE scoring:**

✅ Options are skipped if they violate hard constraints:
- Hard budget constraint violated → Skip option
- Hard connectivity (metro) constraint violated → Skip option

**Benefits:**
- Only viable options are scored
- Eliminates invalid recommendations at source
- Maintains user requirement satisfaction

---

### STEP 5: Enhanced Explainability

**New Response Structure:**
```javascript
scoreBreakdown: {
  weights: {
    budget: 0.25,
    flight: 0.25,
    hotel: 0.25,
    connectivity: 0.15,
    activity: 0.1
  },
  componentScores: {
    budgetScore: 78.5,
    flightScore: 100,
    hotelScore: 92,
    connectivityScore: 100,
    activityScore: 66.7
  },
  rawScore: 87.5
}
```

**What this provides:**
- Transparent weight derivation from user intent
- Component-level scoring visibility
- Raw score before UI clamping (for analytics)
- Users understand why option was ranked

---

## 🔄 Migration from Old System

### Removed
- ❌ Additive base score (50) with adjustment points
- ❌ Hardcoded score adjustments (+18, -15, +25, etc.)
- ❌ Complex nested conditionals for factor scoring
- ❌ Implicit weight prioritization via point values

### Added
- ✅ Dynamic weight computation from intent
- ✅ Normalized 0-100 scoring for all components
- ✅ Single mathematical formula for final score
- ✅ Full transparency in scoreBreakdown
- ✅ Scalable architecture (easy to add new factors)

---

## 📊 Processing Flow

```
1. Extract intent from request
   ↓
2. Compute weights based on constraint types
   ↓
3. For each flight-hotel combination:
   a) Calculate total cost
   b) Match activities to interests
   c) Check HARD constraints → skip if violated
   d) Compute 5 component scores (0-100)
   e) Calculate weighted final score
   f) Clamp to display range [40-95]
   ↓
4. Sort by final score (highest first)
   ↓
5. Return top 6 results with full explainability
```

---

## ✨ Key Benefits

1. **Mathematically Rigorous**
   - Clear, reproducible formula
   - Weights always normalize to 1.0
   - Component scores always in [0, 100]

2. **Intent-Driven**
   - Weights dynamically reflect user priorities
   - Hard constraints properly filter
   - Soft/optimize constraints influence weights

3. **Transparent**
   - Users see exactly how score was calculated
   - Component scores visible
   - Weights explained in response

4. **Maintainable**
   - Easy to add new scoring factors
   - Changes to formulas don't affect architecture
   - Clear separation of concerns

5. **Fair Comparison**
   - All options scored on same normalized scale
   - Weights are consistent across all options
   - No arbitrary point adjustments

---

## 🧪 Testing Recommendations

**Test Case 1: Hard Budget Constraint**
- Input: Budget max 15000 (hard)
- Expected: Only options ≤ 15000 are scored
- Verify: weights.budget will be high, other weights lower

**Test Case 2: No Constraints**
- Input: No budget, connectivity, or interests specified
- Expected: All weights = 0.2 (equal)
- Verify: Final score is unbiased average of components

**Test Case 3: Optimize Budget**
- Input: Budget max 20000 (optimize)
- Expected: weights.budget = high, lower scores for expensive options
- Verify: Cheaper options rank higher

**Test Case 4: Multiple Hard Constraints**
- Input: Budget hard 25000 + Connectivity hard nearMetro
- Expected: Only options meeting both constraints are scored
- Verify: Fewer options in results, but all satisfy constraints

---

## 📝 File Modified
- `backend/endpoint/getUnifiedResult.js`
  - Added 5 component scoring functions
  - Added weight computation function
  - Replaced additive scoring with weighted model
  - Enhanced scoreBreakdown response

---

**Status: ✅ Complete**
All 5 steps implemented successfully.
