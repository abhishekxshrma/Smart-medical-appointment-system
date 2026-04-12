/**
 * middleware/validate.js — Input Validation Middleware
 *
 * Provides reusable Express middleware functions that validate incoming
 * request bodies before they reach the controller layer.
 *
 * If validation fails, the middleware short-circuits with a 422 response
 * and the controller never executes. This keeps controllers clean.
 */

const { sendError } = require("../utils/response");

const VALID_DEPARTMENTS = [
  "General Medicine",
  "Cardiology",
  "Orthopedics",
  "Dermatology",
  "Endocrinology",
  "Neurology",
  "Pediatrics",
  "ENT",
];

// ---------------------------------------------------------------------------
// validateNewPatient
// ---------------------------------------------------------------------------

/**
 * Validates the request body for POST /patients.
 *
 * Required fields: name, age, symptoms
 * Optional fields: department (defaults to "General Medicine")
 *
 * Rules:
 *   - name     → non-empty string
 *   - age      → integer between 0 and 130
 *   - symptoms → non-empty string (minimum 5 chars so it's meaningful)
 *   - department → must be one of the allowed department names
 */
function validateNewPatient(req, res, next) {
  const { name, age, symptoms, department } = req.body;
  const errors = [];

  // ── name ──────────────────────────────────────────────────────────────
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    errors.push("'name' is required and must be a non-empty string");
  }

  // ── age ───────────────────────────────────────────────────────────────
  const parsedAge = Number(age);
  if (age === undefined || age === null || age === "") {
    errors.push("'age' is required");
  } else if (!Number.isInteger(parsedAge) || parsedAge < 0 || parsedAge > 130) {
    errors.push("'age' must be a whole number between 0 and 130");
  }

  // ── symptoms ──────────────────────────────────────────────────────────
  if (!symptoms || typeof symptoms !== "string" || symptoms.trim().length < 5) {
    errors.push("'symptoms' is required and must be at least 5 characters");
  }

  // ── department (optional but validated if provided) ────────────────────
  if (department && !VALID_DEPARTMENTS.includes(department)) {
    errors.push(
      `'department' must be one of: ${VALID_DEPARTMENTS.join(", ")}`
    );
  }

  // ── Return errors or continue ──────────────────────────────────────────
  if (errors.length > 0) {
    return sendError(res, "VALIDATION_ERROR", errors.join(". "), 422);
  }

  next();
}

module.exports = { validateNewPatient };
