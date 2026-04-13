/**
 * controllers/patientController.js — Patient Business Logic (MongoDB edition)
 *
 * Every function is now async because Mongoose operations return Promises.
 * The API contract (URLs, request shapes, response shapes) is identical to
 * the in-memory version — only the data layer changed.
 *
 * Data flow per request:
 *   HTTP request -> route -> (validate middleware) -> controller -> Mongoose -> MongoDB
 *                                                         |
 *                                                  response helper -> HTTP response
 */

const Patient                            = require("../models/Patient");
const { assignPriority, priorityReason } = require("../utils/priorityEngine");
const { calculateETA }                   = require("../utils/etaCalculator");
const { sendSuccess, sendError }         = require("../utils/response");
// ── NEW: AI symptom analysis service ────────────────────────────────────────
const { analyzeSymptoms }                = require("../services/aiService");

// Priority sort order for returning patient lists
const PRIORITY_ORDER = { emergency: 0, high: 1, normal: 2 };

/**
 * Sort patients: emergency first, then high, then normal.
 * Within the same priority, earlier registrations come first.
 */
function sortByPriority(patients) {
  return patients.sort((a, b) => {
    const pdiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (pdiff !== 0) return pdiff;
    return new Date(a.createdAt) - new Date(b.createdAt);
  });
}

// ---------------------------------------------------------------------------
// GET /api/patients
// ---------------------------------------------------------------------------

/**
 * Return all patients with optional query-string filters.
 *
 * Query params (all optional):
 *   ?status=waiting|verified|in-progress|completed
 *   ?priority=normal|high|emergency
 *   ?department=<string>
 */
async function getAllPatients(req, res) {
  try {
    const { status, priority, department } = req.query;

    // Build Mongoose filter object from query params
    const filter = {};

    if (status) {
      const allowed = ["waiting", "verified", "in-progress", "completed"];
      if (!allowed.includes(status)) {
        return sendError(res, "INVALID_FILTER", `'status' must be one of: ${allowed.join(", ")}`);
      }
      filter.status = status;
    }

    if (priority) {
      const allowed = ["normal", "high", "emergency"];
      if (!allowed.includes(priority)) {
        return sendError(res, "INVALID_FILTER", `'priority' must be one of: ${allowed.join(", ")}`);
      }
      filter.priority = priority;
    }

    if (department) {
      // Case-insensitive regex match
      filter.department = { $regex: new RegExp(`^${department}$`, "i") };
    }

    // Fetch from MongoDB — Mongoose Documents serialise with our toJSON transform
    const patients = await Patient.find(filter);
    const sorted   = sortByPriority(patients);

    return sendSuccess(
      res,
      { total: sorted.length, patients: sorted },
      "Patients retrieved successfully"
    );
  } catch (err) {
    console.error("[getAllPatients]", err);
    return sendError(res, "SERVER_ERROR", err.message, 500);
  }
}

// ---------------------------------------------------------------------------
// POST /api/patients
// ---------------------------------------------------------------------------

/**
 * Register a new patient.
 *
 * Steps:
 *   1. Run priority engine  (age + symptoms -> normal / high / emergency)
 *   2. Count active patients to calculate the ETA slot
 *   3. Generate the next sequential token  (T-001, T-002, ...)
 *   4. Save new Patient document to MongoDB
 */
async function registerPatient(req, res) {
  try {
    const {
      name,
      age,
      symptoms,
      department = "General Medicine",
    } = req.body;

    const parsedAge = Number(age);

    // ── CHANGED: AI symptom analysis drives both priority AND advice ──────
    // analyzeSymptoms() is the single source of truth for classification.
    // The existing priorityReason from priorityEngine is kept for audit logs.
    const { priority, advice } = analyzeSymptoms(symptoms, parsedAge);
    const reason               = priorityReason(parsedAge, symptoms); // audit trail

    // Calculate ETA based on how many patients are still active (not completed)
    const activeCount   = await Patient.countActive();
    const estimatedTime = calculateETA(activeCount);

    // Generate next token string (T-001, T-002, ...)
    const token = await Patient.generateToken();

    // Persist to MongoDB
    const newPatient = await Patient.create({
      token,
      name:           name.trim(),
      age:            parsedAge,
      symptoms:       symptoms.trim(),
      department,
      priority,                  // set by AI service
      priorityReason: reason,    // set by existing priorityEngine (audit)
      aiAdvice:       advice,    // ── NEW: patient-facing recommendation
      estimatedTime,
      // status defaults to "waiting" per schema
      // createdAt / updatedAt added automatically by { timestamps: true }
    });

    return sendSuccess(res, newPatient, "Patient registered successfully", 201);
  } catch (err) {
    // Mongoose schema validation failure
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message).join(". ");
      return sendError(res, "VALIDATION_ERROR", messages, 422);
    }
    // Duplicate key on token field (extremely rare race condition)
    if (err.code === 11000) {
      return sendError(res, "DUPLICATE_TOKEN", "Token collision — please retry", 409);
    }
    console.error("[registerPatient]", err);
    return sendError(res, "SERVER_ERROR", err.message, 500);
  }
}

// ---------------------------------------------------------------------------
// GET /api/patients/:id
// ---------------------------------------------------------------------------

/**
 * Fetch a single patient by their MongoDB ObjectId.
 * The frontend receives `id` (not `_id`) thanks to the toJSON transform in the schema.
 */
async function getPatientById(req, res) {
  try {
    const patient = await Patient.findById(req.params.id);

    if (!patient) {
      return sendError(res, "NOT_FOUND", `No patient found with id '${req.params.id}'`, 404);
    }

    return sendSuccess(res, patient, "Patient retrieved successfully");
  } catch (err) {
    // CastError = req.params.id is not a valid ObjectId format
    if (err.name === "CastError") {
      return sendError(res, "INVALID_ID", `'${req.params.id}' is not a valid patient id`, 400);
    }
    console.error("[getPatientById]", err);
    return sendError(res, "SERVER_ERROR", err.message, 500);
  }
}

// ---------------------------------------------------------------------------
// Shared internal helper
// ---------------------------------------------------------------------------

/**
 * Find a patient by id and return the Mongoose Document.
 * If not found (or id is malformed), sends the error response and returns null.
 * Callers MUST check for null before continuing.
 */
async function findPatientOrFail(req, res) {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      sendError(res, "NOT_FOUND", `No patient found with id '${req.params.id}'`, 404);
      return null;
    }
    return patient;
  } catch (err) {
    if (err.name === "CastError") {
      sendError(res, "INVALID_ID", `'${req.params.id}' is not a valid patient id`, 400);
    } else {
      sendError(res, "SERVER_ERROR", err.message, 500);
    }
    return null;
  }
}

// ---------------------------------------------------------------------------
// PUT /api/patients/:id/verify   (Compounder action)
// ---------------------------------------------------------------------------

/**
 * Compounder marks patient as physically present and verified.
 * Transition: waiting -> verified
 */
async function verifyPatient(req, res) {
  try {
    const patient = await findPatientOrFail(req, res);
    if (!patient) return;

    if (patient.status !== "waiting") {
      return sendError(
        res,
        "INVALID_TRANSITION",
        `Cannot verify a patient with status '${patient.status}'. Only 'waiting' patients can be verified.`
      );
    }

    // Mutate the Mongoose Document then save() so validators + updatedAt fire
    patient.status     = "verified";
    patient.verifiedAt = new Date();
    await patient.save();

    return sendSuccess(res, patient, `Patient ${patient.token} verified successfully`);
  } catch (err) {
    console.error("[verifyPatient]", err);
    return sendError(res, "SERVER_ERROR", err.message, 500);
  }
}

// ---------------------------------------------------------------------------
// PUT /api/patients/:id/start   (Doctor action)
// ---------------------------------------------------------------------------

/**
 * Doctor begins a consultation.
 * Transition: verified -> in-progress
 * Guard: patient must have been compounder-verified first.
 */
async function startConsultation(req, res) {
  try {
    const patient = await findPatientOrFail(req, res);
    if (!patient) return;

    if (patient.status !== "verified") {
      return sendError(
        res,
        "INVALID_TRANSITION",
        `Cannot start consultation for status '${patient.status}'. Patient must be 'verified' first.`
      );
    }

    patient.status    = "in-progress";
    patient.startedAt = new Date();
    await patient.save();

    return sendSuccess(res, patient, `Consultation started for patient ${patient.token}`);
  } catch (err) {
    console.error("[startConsultation]", err);
    return sendError(res, "SERVER_ERROR", err.message, 500);
  }
}

// ---------------------------------------------------------------------------
// PUT /api/patients/:id/complete   (Doctor action)
// ---------------------------------------------------------------------------

/**
 * Doctor marks a consultation as complete.
 * Transition: in-progress -> completed
 */
async function completeConsultation(req, res) {
  try {
    const patient = await findPatientOrFail(req, res);
    if (!patient) return;

    if (patient.status !== "in-progress") {
      return sendError(
        res,
        "INVALID_TRANSITION",
        `Cannot complete consultation for status '${patient.status}'. Patient must be 'in-progress'.`
      );
    }

    patient.status      = "completed";
    patient.completedAt = new Date();
    await patient.save();

    return sendSuccess(res, patient, `Consultation completed for patient ${patient.token}`);
  } catch (err) {
    console.error("[completeConsultation]", err);
    return sendError(res, "SERVER_ERROR", err.message, 500);
  }
}

// Same export names as before — routes/patientRoutes.js needs zero changes
module.exports = {
  getAllPatients,
  registerPatient,
  getPatientById,
  verifyPatient,
  startConsultation,
  completeConsultation,
};
