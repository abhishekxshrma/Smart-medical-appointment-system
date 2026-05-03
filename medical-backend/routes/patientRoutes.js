/**
 * routes/patientRoutes.js — Patient API Route Definitions
 *
 * This file is purely about routing: it maps HTTP method + URL path
 * combinations to the appropriate middleware and controller function.
 *
 * No business logic lives here — it delegates entirely to controllers.
 *
 * Route overview:
 * ┌─────────────────────────────────────┬──────────────────────────┬──────────┐
 * │ Method & Path                       │ Action                   │ Role     │
 * ├─────────────────────────────────────┼──────────────────────────┼──────────┤
 * │ GET    /api/patients                │ List all patients        │ All      │
 * │ POST   /api/patients                │ Register new patient     │ Patient  │
 * │ GET    /api/patients/:id            │ Get single patient       │ All      │
 * │ PUT    /api/patients/:id/verify     │ Mark patient arrived     │ Compound │
 * │ PUT    /api/patients/:id/start      │ Begin consultation       │ Doctor   │
 * │ PUT    /api/patients/:id/complete   │ End consultation         │ Doctor   │
 * └─────────────────────────────────────┴──────────────────────────┴──────────┘
 */

const express = require("express");
const router  = express.Router();

// Middleware
const { validateNewPatient } = require("../middleware/validate");
const auth = require("../middleware/auth");

// Controller functions
const {
  getAllPatients,
  registerPatient,
  getPatientById,
  verifyPatient,
  startConsultation,
  completeConsultation,
  cancelPatient,
  getMyPatient,
  getPatientHistory,
  getDoctorPatientHistory,
} = require("../controllers/patientController");

// Require authentication for all patient routes
router.use(auth);

// ---------------------------------------------------------------------------
// Patient CRUD
// ---------------------------------------------------------------------------

// GET /api/patients
// Returns all patients. Supports ?status, ?priority, ?department filters.
router.get("/", getAllPatients);

// POST /api/patients
// Register a new patient. Body is validated before reaching the controller.
router.post("/", validateNewPatient, registerPatient);

// GET /api/patients/my
// Fetch current user's active booking
router.get("/my", getMyPatient);

// GET /api/patients/history
// Fetch logged-in user's past medical history
router.get("/history", getPatientHistory);

// GET /api/patients/:id/history
// Fetch history of specific patient (for doctors)
router.get("/:id/history", getDoctorPatientHistory);

// GET /api/patients/:id
// Fetch one patient by UUID.
router.get("/:id", getPatientById);

// ---------------------------------------------------------------------------
// Compounder Actions
// ---------------------------------------------------------------------------

// PUT /api/patients/:id/verify
// Compounder confirms the patient has physically arrived.
// Transition: waiting → verified
router.put("/:id/verify", verifyPatient);

// PUT /api/patients/:id/cancel
// Compounder cancels a patient request.
router.put("/:id/cancel", cancelPatient);

// ---------------------------------------------------------------------------
// Doctor Actions
// ---------------------------------------------------------------------------

// PUT /api/patients/:id/start
// Doctor begins the consultation session.
// Transition: verified → in-progress
router.put("/:id/start", startConsultation);

// PUT /api/patients/:id/complete
// Doctor marks the consultation as done.
// Transition: in-progress → completed
router.put("/:id/complete", completeConsultation);

module.exports = router;
