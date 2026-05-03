/**
 * models/Patient.js — Patient Mongoose Schema & Model
 *
 * This is the single source of truth for what a Patient document looks like
 * in MongoDB. Mongoose enforces types, defaults, and validation at the
 * ODM layer before data ever touches the database.
 *
 * Collection name: "patients" (Mongoose auto-pluralises "Patient")
 *
 * Fields required by the task:
 *   name, age, symptoms, priority, status, createdAt
 *
 * Additional fields kept for full feature parity with the original API:
 *   token, department, priorityReason, estimatedTime,
 *   verifiedAt, startedAt, completedAt
 */

const mongoose = require("mongoose");

// ─────────────────────────────────────────────────────────────────────────────
// Sub-constants (keep in sync with priorityEngine.js and validate.js)
// ─────────────────────────────────────────────────────────────────────────────

const VALID_STATUSES    = ["waiting", "verified", "in-progress", "completed", "cancelled"];
const VALID_PRIORITIES  = ["normal", "high", "emergency"];
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

// ─────────────────────────────────────────────────────────────────────────────
// Schema definition
// ─────────────────────────────────────────────────────────────────────────────

const patientSchema = new mongoose.Schema(
  {
    // ── Queue token, e.g. "T-101" ─────────────────────────────────────
    token: {
      type:     String,
      required: [true, "Token is required"],
      unique:   true,   // enforced at DB level with a unique index
      trim:     true,
    },

    // ── User association ──────────────────────────────────────────────
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false, // Optional for backward compatibility with old data
    },

    // ── Core patient information ──────────────────────────────────────
    name: {
      type:      String,
      required:  [true, "Patient name is required"],
      trim:      true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name must be under 100 characters"],
    },

    age: {
      type:    Number,
      required:[true, "Age is required"],
      min:     [0,   "Age cannot be negative"],
      max:     [130, "Age cannot exceed 130"],
      // Store as integer — Mongoose will reject floats thanks to `validate`
      validate: {
        validator: Number.isInteger,
        message:   "Age must be a whole number",
      },
    },

    symptoms: {
      type:      String,
      required:  [true, "Symptoms are required"],
      trim:      true,
      minlength: [5, "Symptoms description must be at least 5 characters"],
    },

    department: {
      type:    String,
      enum:    { values: VALID_DEPARTMENTS, message: "'{VALUE}' is not a valid department" },
      default: "General Medicine",
    },

    // ── Auto-assigned by priorityEngine.js ───────────────────────────
    priority: {
      type:    String,
      enum:    { values: VALID_PRIORITIES, message: "'{VALUE}' is not a valid priority" },
      default: "normal",
    },

    // Human-readable explanation of why this priority was assigned.
    // Useful for audit trails and doctor notes.
    priorityReason: {
      type:    String,
      default: "",
    },

    // ── Workflow status ───────────────────────────────────────────────
    // Flow: waiting → verified → in-progress → completed
    status: {
      type:    String,
      enum:    { values: VALID_STATUSES, message: "'{VALUE}' is not a valid status" },
      default: "waiting",
    },

    // Calculated at registration time from queue position
    estimatedTime: {
      type:    String,
      default: "",
    },

    // ── Workflow timestamps ───────────────────────────────────────────
    // These are null until the relevant status transition occurs.
    verifiedAt: {
      type:    Date,
      default: null,
    },

    startedAt: {
      type:    Date,
      default: null,
    },

    // ── Medical History ───────────────────────────────────────────────
    diagnosis: {
      type:    String,
      default: "",
    },

    completedAt: {
      type:    Date,
      default: null,
    },
  },

  {
    // ── Schema options ────────────────────────────────────────────────

    // Automatically adds `createdAt` and `updatedAt` fields.
    // `createdAt` satisfies the task requirement; `updatedAt` is free.
    timestamps: true,

    // When serialising to JSON (e.g. res.json()), apply these transforms:
    toJSON: {
      virtuals: true,       // include virtual fields
      transform(doc, ret) {
        // Rename MongoDB's `_id` → `id` so the API surface is unchanged
        ret.id  = ret._id.toString();
        // Rename `createdAt` → `registeredAt` to match the original API field name
        ret.registeredAt = ret.createdAt ? ret.createdAt.toISOString() : null;
        // Clean up internal Mongo fields from the output
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },

    toObject: { virtuals: true },
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// Indexes
// ─────────────────────────────────────────────────────────────────────────────

// Speed up the most common dashboard queries
patientSchema.index({ status:   1 });   // filter by status
patientSchema.index({ priority: 1 });   // filter by priority
patientSchema.index({ createdAt: 1 });  // sort by registration time

// ─────────────────────────────────────────────────────────────────────────────
// Statics — reusable query helpers attached to the Model
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Count active (non-completed) patients.
 * Used by the ETA calculator to determine queue position.
 */
patientSchema.statics.countActive = function () {
  return this.countDocuments({ status: { $nin: ["completed", "cancelled"] } });
};

/**
 * Get the next sequential token number by finding the highest existing token.
 * Format: "T-NNN" where NNN is zero-padded to at least 3 digits.
 *
 * This is safe for concurrent inserts because Mongoose will throw a
 * duplicate-key error on the `token` unique index if two requests
 * race — the caller should retry in that scenario.
 */
patientSchema.statics.generateToken = async function () {
  // Find the patient with the lexicographically last token (T-999 > T-001)
  const last = await this.findOne({}, { token: 1 }).sort({ token: -1 }).lean();

  if (!last || !last.token) {
    return "T-001"; // very first patient
  }

  // Parse the numeric part: "T-042" → 42
  const num = parseInt(last.token.replace("T-", ""), 10);
  const next = isNaN(num) ? 1 : num + 1;
  return `T-${String(next).padStart(3, "0")}`;
};

/**
 * Get the dynamic queue position for a specific patient.
 * Counts patients with status "waiting", "verified", "in-progress"
 * sorted by createdAt (or token as fallback), returns index + 1
 */
patientSchema.statics.getQueuePosition = async function (patientId) {
  // Find the target patient
  const targetPatient = await this.findById(patientId);
  if (!targetPatient) return null;

  // Get all active patients (not completed)
  const activePatients = await this.find({
    status: { $in: ["waiting", "verified", "in-progress"] }
  }).sort({ createdAt: 1 }); // Sort by registration time

  // Find the position (1-based index)
  const position = activePatients.findIndex(p => p._id.toString() === patientId) + 1;
  return position > 0 ? position : null;
};

// ─────────────────────────────────────────────────────────────────────────────
// Model export
// ─────────────────────────────────────────────────────────────────────────────

const Patient = mongoose.model("Patient", patientSchema);

module.exports = Patient;
