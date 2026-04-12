/**
 * db.js — Deprecated in-memory store
 *
 * This file is no longer used for data storage.
 * MongoDB via Mongoose (see models/Patient.js) is now the data layer.
 *
 * This stub is kept so that any code that accidentally still imports
 * from db.js gets a clear error instead of a silent undefined.
 */

console.warn(
  "[db.js] WARNING: db.js is the old in-memory store and is no longer used. " +
  "Import from models/Patient.js instead."
);

module.exports = {};
