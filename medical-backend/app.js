/**
 * app.js — Express Application Factory (MongoDB edition)
 *
 * Sets up middleware and routes.
 * DB connection happens in server.js before this app starts listening,
 * so every request is guaranteed to have a live DB connection.
 */

const express         = require("express");
const cors            = require("cors");
const logger          = require("./middleware/logger");
const { dbStatus }    = require("./config/database");

const app = express();

// ---------------------------------------------------------------------------
// Global Middleware
// ---------------------------------------------------------------------------

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

// Serve uploaded profile images
app.use("/uploads", express.static("uploads"));

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------

const patientRoutes = require("./routes/patientRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/api/patients", patientRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// ---------------------------------------------------------------------------
// Health Check — now includes MongoDB connection status
// ---------------------------------------------------------------------------

app.get("/health", (req, res) => {
  const db = dbStatus();
  res.status(db === "connected" ? 200 : 503).json({
    status:    db === "connected" ? "ok" : "degraded",
    service:   "Medical Appointment API",
    database:  db,                        // "connected" | "disconnected" | …
    timestamp: new Date().toISOString(),
    uptime:    `${Math.floor(process.uptime())}s`,
  });
});

// ---------------------------------------------------------------------------
// Root — API directory
// ---------------------------------------------------------------------------

app.get("/", (req, res) => {
  res.json({
    name:     "MediQueue API",
    version:  "2.0.0",
    database: "MongoDB (Mongoose)",
    endpoints: {
      health:   "GET  /health",
      auth: {
        signup:   "POST /api/auth/signup",
        login:    "POST /api/auth/login",
      },
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
// 404 handler
// ---------------------------------------------------------------------------

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error:   "NOT_FOUND",
    message: `Route ${req.method} ${req.originalUrl} does not exist`,
  });
});

// ---------------------------------------------------------------------------
// Global error handler
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
