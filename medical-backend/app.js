/**
 * app.js — Express Application Factory
 *
 * Creates and configures the Express app.
 * Kept separate from server.js so the app can be imported in tests
 * without actually binding to a port.
 */

const express = require("express");
const logger  = require("./middleware/logger");

const app = express();

// ---------------------------------------------------------------------------
// Global Middleware
// ---------------------------------------------------------------------------

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded form bodies (e.g. from HTML forms)
app.use(express.urlencoded({ extended: true }));

// Log every request to stdout
app.use(logger);

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------

const patientRoutes = require("./routes/patientRoutes");

// All patient-related routes live under /api/patients
app.use("/api/patients", patientRoutes);

// ---------------------------------------------------------------------------
// Health Check
// ---------------------------------------------------------------------------

/**
 * GET /health
 * Simple liveness probe — useful for load balancers and Docker health checks.
 */
app.get("/health", (req, res) => {
  res.json({
    status:    "ok",
    service:   "Medical Appointment API",
    timestamp: new Date().toISOString(),
    uptime:    `${Math.floor(process.uptime())}s`,
  });
});

// ---------------------------------------------------------------------------
// Root info
// ---------------------------------------------------------------------------

app.get("/", (req, res) => {
  res.json({
    name:    "MediQueue API",
    version: "1.0.0",
    endpoints: {
      health:   "GET  /health",
      patients: {
        list:     "GET  /api/patients",
        register: "POST /api/patients",
        single:   "GET  /api/patients/:id",
        verify:   "PUT  /api/patients/:id/verify",
        start:    "PUT  /api/patients/:id/start",
        complete: "PUT  /api/patients/:id/complete",
      },
    },
  });
});

// ---------------------------------------------------------------------------
// 404 handler — catches any route not matched above
// ---------------------------------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error:   "NOT_FOUND",
    message: `Route ${req.method} ${req.originalUrl} does not exist`,
  });
});

// ---------------------------------------------------------------------------
// Global error handler — catches any unhandled errors thrown in controllers
// ---------------------------------------------------------------------------

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error("[ERROR]", err.stack || err.message);
  res.status(500).json({
    success: false,
    error:   "INTERNAL_SERVER_ERROR",
    message: "An unexpected error occurred. Please try again.",
  });
});

module.exports = app;
