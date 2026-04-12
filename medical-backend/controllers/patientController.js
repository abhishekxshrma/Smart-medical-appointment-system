/**
 * controllers/patientController.js — Patient Business Logic
 *
 * Each function here corresponds to one API endpoint.
 * Controllers:
 *   1. Read from / write to the in-memory store (db.js)
 *   2. Apply business rules (priority engine, ETA calculator)
 *   3. Return standardised responses via the response helper
 *
 * They do NOT touch Express routing — that lives in routes/patientRoutes.js
 */

const { v4: uuidv4 }               = require("uuid");
const { patients, generateToken }  = require("../db");
const { assignPriority, priorityReason } = require("../utils/priorityEngine");
const { calculateETA }             = require("../utils/etaCalculator");
const { sendSuccess, sendError }   = require("../utils/response");

// ---------------------------------------------------------------------------
// GET /api/patients
// ---------------------------------------------------------------------------

/**
 * Return all patients, with optional query-string filters.
 *
 * Query params (all optional):
 *   ?status=waiting|verified|in-progress|completed
 *   ?priority=normal|high|emergency
 *   ?department=<string>
 *
 * Response: sorted by priority (emergency first) then registration time.
 */
function getAllPatients(req, res) {
  let result = [...patients];

  // ── Apply filters ────────────────────────────────────────────────────
  const { status, priority, department } = req.query;

  if (status) {
    const allowed = ["waiting", "verified", "in-progress", "completed"];
    if (!allowed.includes(status)) {
      return sendError(res, "INVALID_FILTER", `'status' must be one of: ${allowed.join(", ")}`);
    }
    result = result.filter((p) => p.status === status);
  }

  if (priority) {
    const allowed = ["normal", "high", "emergency"];
    if (!allowed.includes(priority)) {
      return sendError(res, "INVALID_FILTER", `'priority' must be one of: ${allowed.join(", ")}`);
    }
    result = result.filter((p) => p.priority === priority);
  }

  if (department) {
    result = result.filter(
      (p) => p.department.toLowerCase() === department.toLowerCase()
    );
  }

  // ── Sort: emergency → high → normal, then by registration time ───────
  const PRIORITY_ORDER = { emergency: 0, high: 1, normal: 2 };
  result.sort((a, b) => {
    const pdiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (pdiff !== 0) return pdiff;
    return new Date(a.registeredAt) - new Date(b.registeredAt);
  });

  return sendSuccess(res, {
    total: result.length,
    patients: result,
  }, "Patients retrieved successfully");
}

// ---------------------------------------------------------------------------
// POST /api/patients
// ---------------------------------------------------------------------------

/**
 * Register a new patient.
 *
 * Body (validated by middleware):
 *   { name, age, symptoms, department? }
 *
 * The controller:
 *   1. Generates a unique token and UUID
 *   2. Runs the priority engine to auto-assign priority
 *   3. Calculates ETA based on current queue length
 *   4. Inserts the new patient into the store
 *
 * Response: 201 Created with the full patient object
 */
function registerPatient(req, res) {
  const {
    name,
    age,
    symptoms,
    department = "General Medicine",
  } = req.body;

  // ── Priority assignment ─────────────────────────────────────────────
  const parsedAge    = Number(age);
  const priority     = assignPriority(parsedAge, symptoms);
  const reason       = priorityReason(parsedAge, symptoms);

  // ── ETA: based on how many active (non-completed) patients are ahead ─
  const activeCount  = patients.filter((p) => p.status !== "completed").length;
  const estimatedTime = calculateETA(activeCount);

  // ── Build patient record ────────────────────────────────────────────
  const newPatient = {
    id:            uuidv4(),
    token:         generateToken(),
    name:          name.trim(),
    age:           parsedAge,
    symptoms:      symptoms.trim(),
    department,
    priority,
    priorityReason: reason,        // audit trail for priority decision
    status:        "waiting",
    estimatedTime,
    registeredAt:  new Date().toISOString(),
    verifiedAt:    null,
    startedAt:     null,
    completedAt:   null,
  };

  patients.push(newPatient);

  return sendSuccess(res, newPatient, "Patient registered successfully", 201);
}

// ---------------------------------------------------------------------------
// GET /api/patients/:id
// ---------------------------------------------------------------------------

/**
 * Fetch a single patient by their UUID.
 */
function getPatientById(req, res) {
  const patient = patients.find((p) => p.id === req.params.id);

  if (!patient) {
    return sendError(res, "NOT_FOUND", `No patient found with id '${req.params.id}'`, 404);
  }

  return sendSuccess(res, patient, "Patient retrieved successfully");
}

// ---------------------------------------------------------------------------
// Shared helper: find patient or return 404
// ---------------------------------------------------------------------------

/**
 * Internal helper used by all update controllers.
 * Returns the patient object or sends a 404 and returns null.
 *
 * @param {import('express').Request}  req
 * @param {import('express').Response} res
 * @returns {object|null}
 */
function findPatientOrFail(req, res) {
  const patient = patients.find((p) => p.id === req.params.id);
  if (!patient) {
    sendError(res, "NOT_FOUND", `No patient found with id '${req.params.id}'`, 404);
    return null;
  }
  return patient;
}

// ---------------------------------------------------------------------------
// PUT /api/patients/:id/verify      (Compounder action)
// ---------------------------------------------------------------------------

/**
 * Compounder marks a patient as physically present and verified.
 *
 * Allowed transition:  waiting → verified
 *
 * Business rules:
 *   - Can only verify a patient who is currently "waiting"
 *   - Records the exact timestamp of verification
 */
function verifyPatient(req, res) {
  const patient = findPatientOrFail(req, res);
  if (!patient) return;

  // Guard: only "waiting" patients can be verified
  if (patient.status !== "waiting") {
    return sendError(
      res,
      "INVALID_TRANSITION",
      `Cannot verify a patient with status '${patient.status}'. Only 'waiting' patients can be verified.`
    );
  }

  patient.status     = "verified";
  patient.verifiedAt = new Date().toISOString();

  return sendSuccess(res, patient, `Patient ${patient.token} verified successfully`);
}

// ---------------------------------------------------------------------------
// PUT /api/patients/:id/start       (Doctor action)
// ---------------------------------------------------------------------------

/**
 * Doctor begins a consultation with the patient.
 *
 * Allowed transition:  verified → in-progress
 *
 * Business rules:
 *   - Only verified (compounder-checked) patients can start
 *   - Unverified patients cannot jump directly to consultation
 */
function startConsultation(req, res) {
  const patient = findPatientOrFail(req, res);
  if (!patient) return;

  // Guard: must be verified before doctor can start
  if (patient.status !== "verified") {
    return sendError(
      res,
      "INVALID_TRANSITION",
      `Cannot start consultation for status '${patient.status}'. Patient must be 'verified' first.`
    );
  }

  patient.status    = "in-progress";
  patient.startedAt = new Date().toISOString();

  return sendSuccess(res, patient, `Consultation started for patient ${patient.token}`);
}

// ---------------------------------------------------------------------------
// PUT /api/patients/:id/complete    (Doctor action)
// ---------------------------------------------------------------------------

/**
 * Doctor marks consultation as complete.
 *
 * Allowed transition:  in-progress → completed
 *
 * Business rules:
 *   - Only in-progress consultations can be completed
 *   - Records the exact completion timestamp
 */
function completeConsultation(req, res) {
  const patient = findPatientOrFail(req, res);
  if (!patient) return;

  // Guard: consultation must be in-progress to complete
  if (patient.status !== "in-progress") {
    return sendError(
      res,
      "INVALID_TRANSITION",
      `Cannot complete consultation for status '${patient.status}'. Patient must be 'in-progress'.`
    );
  }

  patient.status      = "completed";
  patient.completedAt = new Date().toISOString();

  return sendSuccess(res, patient, `Consultation completed for patient ${patient.token}`);
}

module.exports = {
  getAllPatients,
  registerPatient,
  getPatientById,
  verifyPatient,
  startConsultation,
  completeConsultation,
};
