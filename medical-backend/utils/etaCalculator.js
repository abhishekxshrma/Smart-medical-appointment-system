/**
 * utils/etaCalculator.js — Queue ETA Estimator
 *
 * Calculates an estimated appointment time for a new patient based on
 * how many patients are currently in the queue ahead of them.
 *
 * Assumptions (configurable):
 *   - Clinic opens at 09:00 AM
 *   - Average consultation time: 20 minutes per patient
 *   - Emergency patients are slotted in next (skip queue)
 */

const CLINIC_OPEN_HOUR   = 9;   // 9:00 AM
const CLINIC_OPEN_MINUTE = 0;
const MINS_PER_PATIENT   = 20;  // average consultation duration

/**
 * Format minutes-since-midnight into "H:MM AM/PM"
 * @param {number} totalMinutes
 * @returns {string}
 */
function formatTime(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  const suffix = h >= 12 ? "PM" : "AM";
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}:${String(m).padStart(2, "0")} ${suffix}`;
}

/**
 * Calculate ETA for a new patient given the current queue length.
 *
 * @param {number} queuePosition - 0-based index of this patient in the queue
 *                                 (i.e. how many non-completed patients are ahead)
 * @returns {string} formatted ETA string, e.g. "11:40 AM"
 */
function calculateETA(queuePosition) {
  const baseMinutes = CLINIC_OPEN_HOUR * 60 + CLINIC_OPEN_MINUTE;
  const etaMinutes  = baseMinutes + queuePosition * MINS_PER_PATIENT;
  return formatTime(etaMinutes);
}

module.exports = { calculateETA };
