/**
 * utils/priorityEngine.js — Smart Priority Assignment
 *
 * Determines a patient's priority level based on two factors:
 *   1. Age  — Seniors (age > 60) automatically get HIGH priority
 *   2. Symptoms — Certain keywords trigger EMERGENCY priority
 *
 * Priority Tiers (highest → lowest):
 *   "emergency"  → Life-threatening symptoms detected
 *   "high"       → Age > 60, or explicitly severe non-emergency symptoms
 *   "normal"     → Everything else
 *
 * This module is intentionally kept pure (no side-effects) so it's easy
 * to unit-test and swap out for an ML-based classifier later.
 */

// ---------------------------------------------------------------------------
// Keyword lists
// ---------------------------------------------------------------------------

/**
 * Symptoms that indicate a potential medical emergency.
 * Matching any of these words bumps priority to "emergency".
 */
const EMERGENCY_KEYWORDS = [
  "chest pain",
  "heart attack",
  "stroke",
  "unconscious",
  "unresponsive",
  "not breathing",
  "stopped breathing",
  "severe bleeding",
  "heavy bleeding",
  "seizure",
  "convulsion",
  "anaphylaxis",
  "allergic reaction",
  "severe allergic",
  "choking",
  "can't breathe",
  "cannot breathe",
  "difficulty breathing",
  "shortness of breath",
  "poisoning",
  "overdose",
  "paralysis",
  "sudden blindness",
  "loss of consciousness",
  "high fever",       // > 104°F context
  "trauma",
  "fracture",
  "broken bone",
  "head injury",
  "severe pain",
];

/**
 * Symptoms that indicate HIGH (but non-emergency) priority.
 * Used when age ≤ 60 but symptoms are still concerning.
 */
const HIGH_PRIORITY_KEYWORDS = [
  "chest tightness",
  "palpitation",
  "irregular heartbeat",
  "persistent vomiting",
  "severe headache",
  "blurred vision",
  "confusion",
  "disorientation",
  "fainting",
  "dizziness",
  "numbness",
  "weakness",
  "abdominal pain",
  "kidney stone",
  "severe rash",
  "high blood pressure",
  "blood in urine",
  "blood in stool",
];

// ---------------------------------------------------------------------------
// Helper: keyword matcher
// ---------------------------------------------------------------------------

/**
 * Check whether any keyword from a list appears in the symptom text.
 * Case-insensitive, matches partial phrases.
 *
 * @param {string}   text     - Raw symptom string from request body
 * @param {string[]} keywords - List of phrases to search for
 * @returns {boolean}
 */
function matchesKeyword(text, keywords) {
  const lower = text.toLowerCase();
  return keywords.some((kw) => lower.includes(kw.toLowerCase()));
}

// ---------------------------------------------------------------------------
// Core export: assignPriority
// ---------------------------------------------------------------------------

/**
 * Determine the priority tier for a new patient.
 *
 * @param {number} age      - Patient's age in years
 * @param {string} symptoms - Raw symptom description from the form
 * @returns {"emergency" | "high" | "normal"} priority
 */
function assignPriority(age, symptoms) {
  // ── Tier 1: Emergency check (symptoms override everything) ──────────────
  if (matchesKeyword(symptoms, EMERGENCY_KEYWORDS)) {
    return "emergency";
  }

  // ── Tier 2: High priority ───────────────────────────────────────────────
  // Either senior patient OR concerning but non-emergency symptoms
  if (age > 60 || matchesKeyword(symptoms, HIGH_PRIORITY_KEYWORDS)) {
    return "high";
  }

  // ── Tier 3: Normal ─────────────────────────────────────────────────────
  return "normal";
}

/**
 * Returns a human-readable explanation of why a priority was assigned.
 * Useful for audit logs or doctor notes.
 *
 * @param {number} age
 * @param {string} symptoms
 * @returns {string} reason
 */
function priorityReason(age, symptoms) {
  if (matchesKeyword(symptoms, EMERGENCY_KEYWORDS)) {
    return "Emergency symptoms detected in description";
  }
  if (age > 60 && matchesKeyword(symptoms, HIGH_PRIORITY_KEYWORDS)) {
    return "Senior patient (age > 60) with high-priority symptoms";
  }
  if (age > 60) {
    return "Senior patient — age above 60";
  }
  if (matchesKeyword(symptoms, HIGH_PRIORITY_KEYWORDS)) {
    return "High-priority symptoms detected";
  }
  return "Standard registration — no elevated risk factors";
}

module.exports = { assignPriority, priorityReason };
