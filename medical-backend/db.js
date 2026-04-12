/**
 * db.js — In-memory data store
 *
 * Acts as a lightweight "database" using a plain JavaScript array.
 * All data lives in process memory and resets on server restart.
 * Replace this module with a real DB adapter (MongoDB, PostgreSQL, etc.)
 * when you're ready to persist data.
 */

// ---------------------------------------------------------------------------
// Token counter — increments for every new patient registered
// ---------------------------------------------------------------------------
let tokenCounter = 100; // Start tokens from T-100

/**
 * Generate the next sequential token string, e.g. "T-101"
 */
function generateToken() {
  tokenCounter += 1;
  return `T-${tokenCounter}`;
}

// ---------------------------------------------------------------------------
// Patient store — array of patient objects
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} Patient
 * @property {string}  id            - UUID (unique identifier)
 * @property {string}  token         - Queue token, e.g. "T-101"
 * @property {string}  name          - Patient full name
 * @property {number}  age           - Patient age
 * @property {string}  symptoms      - Free-text symptom description
 * @property {string}  department    - Target department
 * @property {string}  priority      - "normal" | "high" | "emergency"
 * @property {string}  status        - "waiting" | "verified" | "in-progress" | "completed"
 * @property {string}  estimatedTime - Human-readable ETA string
 * @property {string}  registeredAt  - ISO timestamp of registration
 * @property {string|null} verifiedAt   - ISO timestamp of compounder verification
 * @property {string|null} startedAt    - ISO timestamp doctor started consultation
 * @property {string|null} completedAt  - ISO timestamp consultation completed
 */

/** @type {Patient[]} */
const patients = [
  {
    id: "seed-001",
    token: "T-001",
    name: "Priya Sharma",
    age: 34,
    symptoms: "Fever, headache, mild cough for 3 days",
    department: "General Medicine",
    priority: "normal",
    status: "completed",
    estimatedTime: "9:00 AM",
    registeredAt: new Date("2026-04-12T08:30:00").toISOString(),
    verifiedAt:   new Date("2026-04-12T08:45:00").toISOString(),
    startedAt:    new Date("2026-04-12T09:00:00").toISOString(),
    completedAt:  new Date("2026-04-12T09:20:00").toISOString(),
  },
  {
    id: "seed-002",
    token: "T-002",
    name: "Rahul Mehta",
    age: 52,
    symptoms: "Chest tightness, shortness of breath on exertion",
    department: "Cardiology",
    priority: "high",
    status: "in-progress",
    estimatedTime: "9:30 AM",
    registeredAt: new Date("2026-04-12T08:40:00").toISOString(),
    verifiedAt:   new Date("2026-04-12T08:55:00").toISOString(),
    startedAt:    new Date("2026-04-12T09:30:00").toISOString(),
    completedAt:  null,
  },
  {
    id: "seed-003",
    token: "T-003",
    name: "Anita Verma",
    age: 28,
    symptoms: "Joint pain and swelling in both knees",
    department: "Orthopedics",
    priority: "normal",
    status: "verified",
    estimatedTime: "10:00 AM",
    registeredAt: new Date("2026-04-12T08:50:00").toISOString(),
    verifiedAt:   new Date("2026-04-12T09:10:00").toISOString(),
    startedAt:    null,
    completedAt:  null,
  },
  {
    id: "seed-004",
    token: "T-004",
    name: "Suresh Kumar",
    age: 65,
    symptoms: "Blurred vision, frequent urination, fatigue",
    department: "Endocrinology",
    priority: "high",      // high — age > 60
    status: "waiting",
    estimatedTime: "10:30 AM",
    registeredAt: new Date("2026-04-12T09:00:00").toISOString(),
    verifiedAt:   null,
    startedAt:    null,
    completedAt:  null,
  },
  {
    id: "seed-005",
    token: "T-005",
    name: "Meena Patel",
    age: 19,
    symptoms: "Skin rash and itching on arms and neck",
    department: "Dermatology",
    priority: "normal",
    status: "waiting",
    estimatedTime: "11:00 AM",
    registeredAt: new Date("2026-04-12T09:15:00").toISOString(),
    verifiedAt:   null,
    startedAt:    null,
    completedAt:  null,
  },
];

module.exports = { patients, generateToken };
