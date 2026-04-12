/**
 * server.js — HTTP Server Entry Point
 *
 * This is the only file responsible for binding the Express app to a port.
 * Keeping it separate from app.js means we can import app.js in tests
 * without starting a real server.
 *
 * Usage:
 *   node server.js          → production
 *   npx nodemon server.js   → development (auto-restart on file changes)
 *   npm start               → alias for node server.js
 *   npm run dev             → alias for nodemon
 */

const app  = require("./app");

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

const server = app.listen(PORT, HOST, () => {
  console.log("\n╔══════════════════════════════════════════════╗");
  console.log("║       MediQueue API — Server Running         ║");
  console.log("╠══════════════════════════════════════════════╣");
  console.log(`║  URL   : http://localhost:${PORT}               ║`);
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

// Graceful shutdown — close server before process exits
process.on("SIGTERM", () => {
  console.log("\n[SIGTERM] Gracefully shutting down...");
  server.close(() => {
    console.log("[SIGTERM] Server closed.");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("\n[SIGINT] Shutting down (Ctrl+C)...");
  server.close(() => {
    console.log("[SIGINT] Server closed.");
    process.exit(0);
  });
});
