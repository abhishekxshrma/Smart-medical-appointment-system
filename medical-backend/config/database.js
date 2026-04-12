/**
 * config/database.js — MongoDB Connection Manager
 *
 * Responsibilities:
 *   1. Read MONGO_URI from environment (falls back to local default)
 *   2. Configure Mongoose connection options
 *   3. Log connection lifecycle events (connected, error, disconnected)
 *   4. Export a `connectDB()` function called once at server startup
 *
 * The rest of the app never imports mongoose directly for connection —
 * everything goes through this module so there is one place to change
 * if you swap MongoDB Atlas ↔ local ↔ a test DB.
 */

const mongoose = require("mongoose");

// Read from .env (loaded by server.js before this module runs)
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/mediqueue";

// ─────────────────────────────────────────────────────────────────────────────
// Mongoose global settings
// ─────────────────────────────────────────────────────────────────────────────

// Suppress the Mongoose strictQuery deprecation warning
mongoose.set("strictQuery", true);

// ─────────────────────────────────────────────────────────────────────────────
// Connection lifecycle event listeners
// Mongoose keeps a single connection pool — attach listeners once here.
// ─────────────────────────────────────────────────────────────────────────────

mongoose.connection.on("connected", () => {
  console.log(`[MongoDB] Connected → ${maskUri(MONGO_URI)}`);
});

mongoose.connection.on("error", (err) => {
  console.error(`[MongoDB] Connection error: ${err.message}`);
});

mongoose.connection.on("disconnected", () => {
  console.warn("[MongoDB] Disconnected");
});

// Graceful shutdown: close Mongoose connection when Node process exits
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("[MongoDB] Connection closed on SIGINT");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await mongoose.connection.close();
  console.log("[MongoDB] Connection closed on SIGTERM");
  process.exit(0);
});

// ─────────────────────────────────────────────────────────────────────────────
// connectDB — call this once in server.js before app.listen()
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Establish the Mongoose connection.
 * Throws if the initial connection fails so server.js can exit early
 * rather than starting with a broken DB.
 *
 * @returns {Promise<void>}
 */
async function connectDB() {
  console.log(`[MongoDB] Connecting to ${maskUri(MONGO_URI)} …`);

  await mongoose.connect(MONGO_URI, {
    // How long (ms) to wait for an initial connection before erroring
    serverSelectionTimeoutMS: 5000,

    // How long (ms) a socket stays idle before being closed
    socketTimeoutMS: 45000,
  });
  // "connected" event above fires automatically after this resolves
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hide credentials in the URI before logging.
 * mongodb+srv://user:secret@cluster → mongodb+srv://***@cluster
 *
 * @param {string} uri
 * @returns {string}
 */
function maskUri(uri) {
  return uri.replace(/\/\/[^@]+@/, "//***@");
}

/**
 * Return the current Mongoose connection state as a readable string.
 * Useful for the /health endpoint.
 *
 * States: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
 */
function dbStatus() {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  return states[mongoose.connection.readyState] || "unknown";
}

module.exports = { connectDB, dbStatus };
