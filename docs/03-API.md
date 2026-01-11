# API Documentation

## Base URL
```
Development: http://localhost:3002/api
Production: https://api.yourapp.com/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Auth Endpoints

### POST /auth/verify
Verify Clerk user and get JWT token.

**Request:**
```json
{
  "clerkId": "user_2abc123...",
  "email": "doctor@clinic.com",
  "name": "Dr. Smith"
}
```

**Response (200 - Approved User):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "name": "Dr. Smith",
    "email": "doctor@clinic.com",
    "role": "doctor",
    "status": "approved"
  }
}
```

**Response (403 - Pending User):**
```json
{
  "success": false,
  "message": "Account pending admin approval",
  "status": "pending"
}
```

**Response (404 - New User):**
```json
{
  "success": false,
  "message": "User not registered",
  "action": "register"
}
```

---

## Queue Endpoints

### POST /queues
Create or get today's queue for a doctor.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "clinicId": "uuid",
  "doctorId": "uuid"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "clinicId": "uuid",
  "doctorId": "uuid",
  "date": "2024-01-15",
  "status": "open",
  "currentTokenId": null,
  "tokens": []
}
```

---

### GET /queues/today
Get today's queue for the authenticated doctor/assistant.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "date": "2024-01-15",
  "status": "open",
  "currentToken": {
    "id": "uuid",
    "tokenNumber": 5,
    "patient": { "name": "John Doe" },
    "status": "in_progress"
  },
  "tokens": [
    {
      "id": "uuid",
      "tokenNumber": 1,
      "status": "completed",
      "patient": { "name": "Jane Smith", "phone": "9876543210" }
    }
  ],
  "stats": {
    "total": 12,
    "waiting": 5,
    "completed": 6,
    "noShow": 1
  }
}
```

---

### PATCH /queues/:id/pause
Pause the queue (break time).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "status": "paused",
  "message": "Queue paused"
}
```

---

### PATCH /queues/:id/resume
Resume the queue after break.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "status": "open",
  "message": "Queue resumed"
}
```

---

### PATCH /queues/:id/close
Close the queue (end of day).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "status": "closed",
  "message": "Queue closed",
  "stats": {
    "total": 25,
    "completed": 22,
    "noShow": 3
  }
}
```

---

## Token Endpoints

### POST /tokens
Add a patient to the queue (walk-in or existing).

**Headers:** `Authorization: Bearer <token>`

**Request (New Patient):**
```json
{
  "queueId": "uuid",
  "patientName": "John Doe",
  "patientPhone": "9876543210"
}
```

**Request (Existing Patient):**
```json
{
  "queueId": "uuid",
  "patientId": "uuid"
}
```

**Request (Emergency):**
```json
{
  "queueId": "uuid",
  "patientName": "Emergency Patient",
  "patientPhone": "9876543211",
  "isEmergency": true
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "tokenNumber": 13,
  "status": "waiting",
  "position": 5,
  "isEmergency": false,
  "patient": {
    "id": "uuid",
    "name": "John Doe",
    "phone": "9876543210"
  },
  "queueUrl": "https://app.com/q/abc123"
}
```

---

### GET /tokens?queueId=uuid
List all tokens in a queue.

**Headers:** `Authorization: Bearer <token>`

**Query Params:**
- `queueId` (required) - Queue ID
- `status` (optional) - Filter by status

**Response (200):**
```json
{
  "tokens": [
    {
      "id": "uuid",
      "tokenNumber": 1,
      "status": "completed",
      "position": 1,
      "patient": { "name": "Patient 1" },
      "calledAt": "2024-01-15T10:30:00Z",
      "completedAt": "2024-01-15T10:45:00Z"
    }
  ],
  "total": 15
}
```

---

### PATCH /tokens/:id/skip
Skip a patient (temporarily).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "status": "skipped",
  "message": "Patient skipped"
}
```

---

### PATCH /tokens/:id/noshow
Mark patient as no-show.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "status": "no_show",
  "message": "Marked as no-show"
}
```

---

### PATCH /tokens/:id/readd
Re-add a skipped patient to queue.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "status": "waiting",
  "position": 8,
  "message": "Patient re-added to queue"
}
```

---

### DELETE /tokens/:id
Cancel a token.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Token cancelled"
}
```

---

## Doctor Action Endpoints

### POST /doctor/call-next
Call the next patient in queue.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "token": {
    "id": "uuid",
    "tokenNumber": 6,
    "status": "called",
    "patient": { "name": "Next Patient" }
  },
  "message": "Calling token #6"
}
```

**Response (404 - No patients waiting):**
```json
{
  "message": "No patients waiting"
}
```

---

### POST /doctor/start
Start consultation with current patient.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "token": {
    "id": "uuid",
    "tokenNumber": 6,
    "status": "in_progress",
    "startedAt": "2024-01-15T10:30:00Z"
  },
  "message": "Consultation started"
}
```

---

### POST /doctor/complete
End consultation with current patient.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "token": {
    "id": "uuid",
    "tokenNumber": 6,
    "status": "completed",
    "completedAt": "2024-01-15T10:45:00Z"
  },
  "message": "Consultation completed",
  "nextWaiting": 4
}
```

---

## Patient Endpoints

### GET /patients?phone=9876543210
Search patient by phone number.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "patient": {
    "id": "uuid",
    "name": "John Doe",
    "phone": "9876543210",
    "lastVisit": "2024-01-10"
  }
}
```

---

### POST /patients
Create a new patient.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "name": "John Doe",
  "phone": "9876543210"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "name": "John Doe",
  "phone": "9876543210"
}
```

---

## Public Endpoints (No Auth)

### GET /public/queue/:queueId
Get live queue state for patients.

**Response (200):**
```json
{
  "clinicName": "City Clinic",
  "doctorName": "Dr. Smith",
  "status": "open",
  "currentToken": 6,
  "waitingCount": 4,
  "tokens": [
    { "tokenNumber": 6, "status": "in_progress" },
    { "tokenNumber": 7, "status": "waiting" },
    { "tokenNumber": 8, "status": "waiting" }
  ]
}
```

---

### GET /public/token/:tokenId
Get specific token status for patient.

**Response (200):**
```json
{
  "tokenNumber": 8,
  "status": "waiting",
  "position": 2,
  "currentToken": 6,
  "estimatedWait": "~10 minutes"
}
```

---

## Admin Endpoints

### GET /admin/users?status=pending
List users by status.

**Headers:** `Authorization: Bearer <token>` (admin only)

**Response (200):**
```json
{
  "users": [
    {
      "id": "uuid",
      "name": "Dr. New",
      "email": "new@clinic.com",
      "role": "doctor",
      "status": "pending",
      "createdAt": "2024-01-15T09:00:00Z"
    }
  ]
}
```

---

### PATCH /admin/users/:id/approve
Approve a pending user.

**Headers:** `Authorization: Bearer <token>` (admin only)

**Request:**
```json
{
  "role": "doctor"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "approved",
  "role": "doctor",
  "message": "User approved"
}
```

---

### PATCH /admin/users/:id/block
Block a user.

**Headers:** `Authorization: Bearer <token>` (admin only)

**Response (200):**
```json
{
  "id": "uuid",
  "status": "blocked",
  "message": "User blocked"
}
```

---

### POST /admin/clinic-doctors
Assign a doctor to a clinic.

**Headers:** `Authorization: Bearer <token>` (admin only)

**Request:**
```json
{
  "clinicId": "uuid",
  "userId": "uuid"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "clinicId": "uuid",
  "userId": "uuid",
  "isActive": true
}
```

---

### POST /admin/doctor-assistants
Assign an assistant to a doctor.

**Headers:** `Authorization: Bearer <token>` (admin only)

**Request:**
```json
{
  "doctorId": "uuid",
  "assistantId": "uuid"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "doctorId": "uuid",
  "assistantId": "uuid",
  "isActive": true
}
```

---

## WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:3002', {
  query: { queueId: 'uuid' }
});
```

### Events (Server → Client)

| Event | Payload | Description |
|-------|---------|-------------|
| `queue:update` | `{ queueId, status }` | Queue status changed |
| `token:added` | `{ token }` | New patient added |
| `token:called` | `{ tokenNumber, patientName }` | Patient called |
| `token:status` | `{ tokenId, status }` | Token status changed |
| `queue:paused` | `{ queueId }` | Queue paused |
| `queue:resumed` | `{ queueId }` | Queue resumed |

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `CONFLICT` | 409 | Resource already exists |
| `QUEUE_CLOSED` | 400 | Queue is closed |
| `QUEUE_PAUSED` | 400 | Queue is paused |
