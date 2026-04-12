/**
 * utils/response.js — Standardised API Response Helpers
 *
 * All API responses follow the same envelope shape so the frontend
 * (and any API clients) always know where to find data vs errors:
 *
 *  Success:  { success: true,  data: <payload>,  message: "..." }
 *  Error:    { success: false, error: "...",      message: "..." }
 */

/**
 * Send a successful JSON response.
 *
 * @param {import('express').Response} res
 * @param {*}      data    - The payload to return
 * @param {string} message - Human-readable success message
 * @param {number} status  - HTTP status code (default 200)
 */
function sendSuccess(res, data, message = "OK", status = 200) {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

/**
 * Send an error JSON response.
 *
 * @param {import('express').Response} res
 * @param {string} error   - Short error code or description
 * @param {string} message - Detailed human-readable explanation
 * @param {number} status  - HTTP status code (default 400)
 */
function sendError(res, error, message, status = 400) {
  return res.status(status).json({
    success: false,
    error,
    message,
  });
}

module.exports = { sendSuccess, sendError };
