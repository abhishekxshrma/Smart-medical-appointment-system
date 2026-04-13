/**
 * services/aiService.js — AI-Based Symptom Analysis Service
 *
 * A rule-based symptom analyser that classifies patient priority and
 * returns actionable advice. Designed to be the single entry point for
 * all AI/ML logic so the rest of the backend stays decoupled from the
 * classification strategy.
 *
 * Usage:
 *   const { analyzeSymptoms } = require("./services/aiService");
 *   const { priority, advice } = analyzeSymptoms(symptoms, age);
 *
 * Return shape:
 *   {
 *     priority : "emergency" | "high" | "normal",
 *     advice   : string   // human-readable recommendation
 *   }
 *
 * Upgrade path:
 *   Replace the rule engine below with an HTTP call to an LLM or a
 *   TensorFlow.js model — the function signature stays the same, so
 *   the controller needs zero changes.
 */

// ---------------------------------------------------------------------------
// Keyword lists (task-specified triggers)
// ---------------------------------------------------------------------------

/**
 * Any of these substrings in the symptom text → EMERGENCY priority.
 * Checked case-insensitively and as substrings (so "difficulty breathing"
 * matches the "breathing" rule without extra configuration).
 */
const EMERGENCY_TRIGGERS = [
  "chest pain",
  "breathing",        // covers: difficulty breathing, shortness of breath, etc.
  "accident",
  "bleeding",         // covers: severe bleeding, heavy bleeding, etc.
];

// ---------------------------------------------------------------------------
// Core function
// ---------------------------------------------------------------------------

/**
 * analyzeSymptoms — classify a patient's priority and produce advice.
 *
 * Decision logic (in priority order):
 *   1. Emergency keyword match → "emergency" (overrides age)
 *   2. Age > 60               → "high"
 *   3. Everything else        → "normal"
 *
 * @param {string} symptoms - Free-text symptom description from the patient form
 * @param {number} age      - Patient age in years
 * @returns {{ priority: string, advice: string }}
 */
function analyzeSymptoms(symptoms, age) {
  // Normalise once — all comparisons are lowercase substring matches
  console.log("[AI Service] Processing symptoms:", symptoms);
  const lower = String(symptoms || "").toLowerCase();

  // ── Step 1: Emergency keyword check ──────────────────────────────────────
  // A single matching keyword is enough to escalate to emergency.
  const isEmergency = EMERGENCY_TRIGGERS.some((trigger) =>
    lower.includes(trigger)
  );

  if (isEmergency) {
    return {
      priority: "emergency",
      advice:   "Go to emergency immediately",
    };
  }

  // ── Step 2: Senior patient check ─────────────────────────────────────────
  if (age > 60) {
    return {
      priority: "high",
      advice:   "Consult doctor soon",
    };
  }

  // ── Step 3: Default ───────────────────────────────────────────────────────
  return {
    priority: "normal",
    advice:   "Visit OPD",
  };
}

module.exports = { analyzeSymptoms };
