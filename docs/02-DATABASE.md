# Database Schema

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────────┐
│   clinics   │       │      users      │       │    patients     │
├─────────────┤       ├─────────────────┤       ├─────────────────┤
│ id (PK)     │       │ id (PK)         │       │ id (PK)         │
│ name        │       │ clerkId         │       │ name            │
│ address     │       │ name            │       │ phone (unique)  │
│ phone       │       │ email           │       │ createdAt       │
│ openTime    │       │ phone           │       │ updatedAt       │
│ closeTime   │       │ role            │       └─────────────────┘
│ createdAt   │       │ status          │               │
│ updatedAt   │       │ createdAt       │               │
└─────────────┘       │ updatedAt       │               │
       │              └─────────────────┘               │
       │                     │                          │
       ▼                     ▼                          │
┌─────────────────┐   ┌─────────────────┐              │
│ clinic_doctors  │   │doctor_assistants│              │
├─────────────────┤   ├─────────────────┤              │
│ id (PK)         │   │ id (PK)         │              │
│ clinicId (FK)   │   │ doctorId (FK)   │              │
│ userId (FK)     │   │ assistantId(FK) │              │
│ isActive        │   │ isActive        │              │
│ createdAt       │   │ createdAt       │              │
└─────────────────┘   └─────────────────┘              │
       │                     │                          │
       └──────────┬──────────┘                          │
                  ▼                                     │
           ┌─────────────┐                              │
           │   queues    │                              │
           ├─────────────┤                              │
           │ id (PK)     │                              │
           │ clinicId    │                              │
           │ doctorId    │                              │
           │ date        │                              │
           │ status      │                              │
           │ currentToken│                              │
           │ createdAt   │                              │
           └─────────────┘                              │
                  │                                     │
                  ▼                                     │
           ┌─────────────────┐                          │
           │     tokens      │◄─────────────────────────┘
           ├─────────────────┤
           │ id (PK)         │
           │ queueId (FK)    │
           │ patientId (FK)  │
           │ tokenNumber     │
           │ status          │
           │ isEmergency     │
           │ position        │
           │ createdAt       │
           │ calledAt        │
           │ startedAt       │
           │ completedAt     │
           └─────────────────┘
```

---

## Table Definitions

### 1. clinics
Stores clinic information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| name | VARCHAR(255) | NOT NULL | Clinic name |
| address | TEXT | | Clinic address |
| phone | VARCHAR(20) | | Contact number |
| openTime | TIME | | Opening time (e.g., 09:00) |
| closeTime | TIME | | Closing time (e.g., 18:00) |
| createdAt | TIMESTAMP | | Auto-generated |
| updatedAt | TIMESTAMP | | Auto-generated |

---

### 2. users
All authenticated users (admin, doctor, assistant).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| clerkId | VARCHAR(255) | UNIQUE, NOT NULL | Clerk user ID |
| name | VARCHAR(255) | NOT NULL | Full name |
| email | VARCHAR(255) | UNIQUE | Email address |
| phone | VARCHAR(20) | | Phone number |
| role | ENUM | NOT NULL | 'admin', 'doctor', 'assistant' |
| status | ENUM | DEFAULT 'pending' | 'pending', 'approved', 'blocked' |
| createdAt | TIMESTAMP | | Auto-generated |
| updatedAt | TIMESTAMP | | Auto-generated |

**Role Values:**
- `admin` - Can approve users and manage assignments
- `doctor` - Can call patients, start/end consultations
- `assistant` - Can manage queue, add patients, handle exceptions

**Status Values:**
- `pending` - Awaiting admin approval
- `approved` - Can access the system
- `blocked` - Access revoked

---

### 3. clinic_doctors
Links doctors to clinics (many-to-many).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| clinicId | UUID | FK → clinics.id | Clinic reference |
| userId | UUID | FK → users.id | Doctor user reference |
| isActive | BOOLEAN | DEFAULT true | Currently active at clinic |
| createdAt | TIMESTAMP | | Auto-generated |

---

### 4. doctor_assistants
Links assistants to doctors.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| doctorId | UUID | FK → users.id | Doctor user reference |
| assistantId | UUID | FK → users.id | Assistant user reference |
| isActive | BOOLEAN | DEFAULT true | Currently active |
| createdAt | TIMESTAMP | | Auto-generated |

---

### 5. patients
Walk-in patients (no login required).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| name | VARCHAR(255) | NOT NULL | Patient name |
| phone | VARCHAR(20) | UNIQUE, NOT NULL | Phone number (for lookup) |
| createdAt | TIMESTAMP | | Auto-generated |
| updatedAt | TIMESTAMP | | Auto-generated |

---

### 6. queues
Daily queue for each doctor.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| clinicId | UUID | FK → clinics.id | Clinic reference |
| doctorId | UUID | FK → users.id | Doctor reference |
| date | DATE | NOT NULL | Queue date (YYYY-MM-DD) |
| status | ENUM | DEFAULT 'open' | 'open', 'paused', 'closed' |
| currentTokenId | UUID | FK → tokens.id | Currently called token |
| createdAt | TIMESTAMP | | Auto-generated |
| updatedAt | TIMESTAMP | | Auto-generated |

**Unique Constraint:** (clinicId, doctorId, date) - One queue per doctor per day

**Status Values:**
- `open` - Queue is active, accepting patients
- `paused` - Break time, queue frozen
- `closed` - End of day, no more patients

---

### 7. tokens
Individual patient tokens in a queue.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Primary key |
| queueId | UUID | FK → queues.id | Queue reference |
| patientId | UUID | FK → patients.id | Patient reference |
| tokenNumber | INTEGER | NOT NULL | Display number (1, 2, 3...) |
| status | ENUM | DEFAULT 'waiting' | Token status |
| isEmergency | BOOLEAN | DEFAULT false | Emergency patient (jumps queue) |
| position | INTEGER | NOT NULL | Queue position (for reordering) |
| createdAt | TIMESTAMP | | When token was created |
| calledAt | TIMESTAMP | | When patient was called |
| startedAt | TIMESTAMP | | When consultation started |
| completedAt | TIMESTAMP | | When consultation ended |

**Status Values:**
- `waiting` - In queue, waiting to be called
- `called` - Called by doctor, walking to room
- `in_progress` - Consultation in progress
- `completed` - Consultation finished
- `skipped` - Skipped by doctor
- `no_show` - Patient didn't respond when called
- `cancelled` - Token cancelled by assistant

---

## Indexes

```sql
-- Fast lookup for user by Clerk ID
CREATE INDEX idx_users_clerk_id ON users(clerkId);

-- Fast lookup for today's queue
CREATE INDEX idx_queues_date ON queues(date);
CREATE INDEX idx_queues_doctor_date ON queues(doctorId, date);

-- Fast token lookup by queue
CREATE INDEX idx_tokens_queue ON tokens(queueId);
CREATE INDEX idx_tokens_status ON tokens(queueId, status);

-- Fast patient search by phone
CREATE INDEX idx_patients_phone ON patients(phone);
```

---

## Sequelize Associations

```javascript
// Clinic associations
Clinic.hasMany(ClinicDoctor, { foreignKey: 'clinicId' });
Clinic.hasMany(Queue, { foreignKey: 'clinicId' });

// User associations
User.hasMany(ClinicDoctor, { foreignKey: 'userId', as: 'clinicAssignments' });
User.hasMany(DoctorAssistant, { foreignKey: 'doctorId', as: 'assistants' });
User.hasMany(DoctorAssistant, { foreignKey: 'assistantId', as: 'doctors' });
User.hasMany(Queue, { foreignKey: 'doctorId' });

// Queue associations
Queue.belongsTo(Clinic, { foreignKey: 'clinicId' });
Queue.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });
Queue.hasMany(Token, { foreignKey: 'queueId' });
Queue.belongsTo(Token, { foreignKey: 'currentTokenId', as: 'currentToken' });

// Token associations
Token.belongsTo(Queue, { foreignKey: 'queueId' });
Token.belongsTo(Patient, { foreignKey: 'patientId' });

// Patient associations
Patient.hasMany(Token, { foreignKey: 'patientId' });
```
