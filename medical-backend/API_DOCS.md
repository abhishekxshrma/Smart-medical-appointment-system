# MediQueue — Backend API Reference

## Overview

Base URL: `http://localhost:5000`

All responses follow this envelope:

```json
// Success
{ "success": true,  "message": "...", "data": { ... } }

// Error
{ "success": false, "error": "ERROR_CODE", "message": "..." }
```

---

## Status Flow

Each patient moves through statuses in this order:

```
[Register] → waiting → verified → in-progress → completed
                ↑           ↑            ↑
           (patient)  (compounder)   (doctor)
```

## Priority Tiers

| Priority    | Trigger                                                      |
|-------------|--------------------------------------------------------------|
| `emergency` | Symptoms contain keywords: chest pain, stroke, seizure, etc. |
| `high`      | Age > 60 OR high-concern symptoms (blurred vision, etc.)     |
| `normal`    | Everything else                                              |

---

## Endpoints

---

### GET /health
Liveness check.

```bash
curl http://localhost:5000/health
```

---

### GET /api/patients
Returns all patients sorted by priority then registration time.

**Optional query filters:**
| Param        | Values                                       |
|--------------|----------------------------------------------|
| `status`     | `waiting`, `verified`, `in-progress`, `completed` |
| `priority`   | `normal`, `high`, `emergency`                |
| `department` | Any department name                          |

```bash
# All patients
curl http://localhost:5000/api/patients

# Only waiting patients
curl "http://localhost:5000/api/patients?status=waiting"

# High-priority patients
curl "http://localhost:5000/api/patients?priority=high"

# Filter by department
curl "http://localhost:5000/api/patients?department=Cardiology"
```

**Response:**
```json
{
  "success": true,
  "message": "Patients retrieved successfully",
  "data": {
    "total": 5,
    "patients": [ { ...patientObject }, ... ]
  }
}
```

---

### POST /api/patients
Register a new patient. Priority is auto-assigned.

**Body:**
| Field        | Type   | Required | Notes                          |
|--------------|--------|----------|--------------------------------|
| `name`       | string | ✅       |                                |
| `age`        | number | ✅       | 0–130                          |
| `symptoms`   | string | ✅       | min 5 characters               |
| `department` | string | ❌       | Defaults to "General Medicine" |

```bash
# Normal priority — young patient, mild symptoms
curl -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Kavya Singh",
    "age": 25,
    "symptoms": "Mild sore throat and runny nose",
    "department": "General Medicine"
  }'

# HIGH priority — age > 60 (auto-detected)
curl -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ramesh Gupta",
    "age": 72,
    "symptoms": "Persistent fatigue and back pain",
    "department": "Orthopedics"
  }'

# EMERGENCY priority — critical symptoms (auto-detected)
curl -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Arjun Nair",
    "age": 45,
    "symptoms": "Severe chest pain radiating to left arm, difficulty breathing",
    "department": "Cardiology"
  }'
```

**Response (201):**
```json
{
  "success": true,
  "message": "Patient registered successfully",
  "data": {
    "id": "uuid-here",
    "token": "T-101",
    "name": "Kavya Singh",
    "age": 25,
    "symptoms": "Mild sore throat and runny nose",
    "department": "General Medicine",
    "priority": "normal",
    "priorityReason": "Standard registration — no elevated risk factors",
    "status": "waiting",
    "estimatedTime": "10:20 AM",
    "registeredAt": "2026-04-12T10:05:00.000Z",
    "verifiedAt": null,
    "startedAt": null,
    "completedAt": null
  }
}
```

---

### GET /api/patients/:id
Fetch a single patient by their UUID.

```bash
curl http://localhost:5000/api/patients/seed-004
```

---

### PUT /api/patients/:id/verify
**Compounder action.** Marks patient as physically present.

Transition: `waiting → verified`

```bash
curl -X PUT http://localhost:5000/api/patients/seed-004/verify
```

**Error if not in "waiting" status:**
```json
{
  "success": false,
  "error": "INVALID_TRANSITION",
  "message": "Cannot verify a patient with status 'verified'. Only 'waiting' patients can be verified."
}
```

---

### PUT /api/patients/:id/start
**Doctor action.** Begins consultation. Patient must be verified first.

Transition: `verified → in-progress`

```bash
curl -X PUT http://localhost:5000/api/patients/seed-003/start
```

---

### PUT /api/patients/:id/complete
**Doctor action.** Marks consultation as complete.

Transition: `in-progress → completed`

```bash
curl -X PUT http://localhost:5000/api/patients/seed-002/complete
```

---

## Full Workflow Example

```bash
# 1. Register a new patient
curl -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Patient","age":35,"symptoms":"Headache and mild fever for 2 days"}'
# → note the "id" in the response, e.g. "abc-123"

# 2. Compounder verifies arrival
curl -X PUT http://localhost:5000/api/patients/abc-123/verify

# 3. Doctor starts consultation
curl -X PUT http://localhost:5000/api/patients/abc-123/start

# 4. Doctor completes consultation
curl -X PUT http://localhost:5000/api/patients/abc-123/complete

# 5. Check final state
curl http://localhost:5000/api/patients/abc-123
```

---

## Validation Errors (422)

```bash
# Missing name
curl -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -d '{"age": 30, "symptoms": "Headache"}'
# → { "error": "VALIDATION_ERROR", "message": "'name' is required..." }

# Invalid age
curl -X POST http://localhost:5000/api/patients \
  -H "Content-Type: application/json" \
  -d '{"name":"X","age":200,"symptoms":"Headache"}'
# → { "error": "VALIDATION_ERROR", "message": "'age' must be a whole number between 0 and 130" }
```

---

## Running the Server

```bash
cd medical-backend

# Install dependencies
npm install

# Development (auto-restarts on changes)
npm run dev

# Production
npm start
```
