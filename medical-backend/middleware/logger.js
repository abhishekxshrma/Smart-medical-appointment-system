/**
 * middleware/logger.js — Simple Request Logger
 *
 * Logs every incoming HTTP request to stdout with:
 *   - Timestamp
 *   - HTTP method
 *   - URL path
 *   - Response status code
 *   - Response time in milliseconds
 *
 * Example output:
 *   [2026-04-12 09:34:02] POST /api/patients → 201 (12ms)
 *
 * In production you would swap this for a structured logger like Winston or Pino.
 */

function logger(req, res, next) {
  const start = Date.now();

  // Hook into response finish event so we can log the status code
  res.on("finish", () => {
    const duration = Date.now() - start;
    const time     = new Date().toISOString().replace("T", " ").slice(0, 19);
    const status   = res.statusCode;

    // Colour-code status for readability in terminal
    const colour =
      status >= 500 ? "\x1b[31m" :   // red
      status >= 400 ? "\x1b[33m" :   // yellow
      status >= 200 ? "\x1b[32m" :   // green
      "\x1b[0m";                      // reset

    console.log(
      `[${time}] ${req.method.padEnd(6)} ${req.originalUrl.padEnd(35)} ${colour}→ ${status}\x1b[0m (${duration}ms)`
    );
  });

  next();
}

module.exports = logger;
