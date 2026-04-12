/**
 * server.js — HTTP Server Entry Point (MongoDB edition)
 *
 * Boot sequence:
 *   1. Load .env variables
 *   2. Connect to MongoDB  (fail fast if DB is unreachable)
 *   3. Start Express HTTP server
 *   4. Register graceful shutdown handlers
 *
 * The server deliberately does NOT start listening until the database
 * connection is established. This prevents accepting requests that would
 * immediately fail with DB errors.
 */

// Load environment variables from .env before anything else
require("dotenv").config();

const app              = require("./app");
const { connectDB }    = require("./config/database");

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

// ---------------------------------------------------------------------------
// Boot function — async so we can await the DB connection
// ---------------------------------------------------------------------------

async function boot() {
  try {
    // Step 1: Connect to MongoDB — throws if connection fails
    await connectDB();

    // Step 2: Start HTTP server only after DB is ready
    const server = app.listen(PORT, HOST, () => {
      console.log("\n╔══════════════════════════════════════════════╗");
      console.log("║    MediQueue API — Server Running (MongoDB)  ║");
      console.log("╠══════════════════════════════════════════════╣");
      console.log(`║  URL   : http://localhost:${PORT}               ║`);
      console.log(`║  DB    : MongoDB (Mongoose)                  ║`);
      console.log(`║  Env   : ${(process.env.NODE_ENV || "development").padEnd(35)}║`);
      console.log("╠══════════════════════════════════════════════╣");
      console.log("║  Endpoints:                                  ║");
      console.log("║  GET  /health                                ║");
      console.log("║  GET  /api/patients                          ║");
      console.log("║  POST /api/patients                          ║");
      console.log("║  GET  /api/patients/:id                      ║");
      console.log("║  PUT  /api/patients/:id/verify               ║");
      console.log("║  PUT  /api/patients/:id/start                ║");
      console.log("║  PUT  /api/patients/:id/complete             ║");
      console.log("╚══════════════════════════════════════════════╝\n");
    });

    // Step 3: Graceful shutdown — close server then DB connection
    const shutdown = async (signal) => {
      console.log(`\n[${signal}] Gracefully shutting down…`);
      server.close(async () => {
        console.log(`[${signal}] HTTP server closed`);
        process.exit(0);
        // MongoDB connection is closed by the listeners in config/database.js
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT",  () => shutdown("SIGINT"));

  } catch (err) {
    // If MongoDB connection fails at startup, log and exit immediately
    console.error("\n[FATAL] Could not connect to MongoDB:", err.message);
    console.error("[FATAL] Make sure MongoDB is running and MONGO_URI is correct.");
    console.error("[FATAL] Copy .env.example to .env and set MONGO_URI.\n");
    process.exit(1);
  }
}

boot();
