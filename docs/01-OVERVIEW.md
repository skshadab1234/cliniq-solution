# Clinic Queue Management System - Overview

## Product Vision

A single-purpose SaaS for small/mid-size clinics to solve **patient waiting chaos** caused by manual token systems.

### What This Is
- Real-time queue & token management
- Assistant-first, doctor-minimal interface
- Patient-facing live queue display (no app, no login)

### What This Is NOT
- NOT a hospital ERP
- NOT an EMR (Electronic Medical Records)
- NOT billing software
- NOT appointment scheduling
- NOT telemedicine

---

## Core Problem

Patients don't know:
- Their position in queue
- How long they'll wait
- When they're being called

Clinics struggle with:
- Manual token systems (paper/whiteboard)
- No way for doctors to signal "next patient"
- Patient complaints about wait times

---

## Solution

| User | Experience |
|------|------------|
| Assistant | Adds patients, manages queue, handles exceptions |
| Doctor | Taps 3 buttons: Call Next → Start → Complete |
| Patient | Views live queue on phone (no app needed) |
| Admin | Approves users, assigns roles |

---

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL + Sequelize ORM
- JWT for API authorization
- Socket.IO for real-time updates

### Frontend
- Next.js 15 (App Router)
- React 19 + TypeScript
- Tailwind CSS
- Clerk for authentication
- Socket.IO client

### Authentication
- Clerk handles sign-in (OTP/email/OAuth)
- Backend verifies Clerk UID → issues JWT
- Role-based access (admin/doctor/assistant)

---

## Directory Structure

```
clinic-solution/
├── backend/
│   ├── config/          # Database config
│   ├── middleware/      # Auth middleware
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   └── index.js         # Server entry
│
├── frontend/
│   ├── app/             # Next.js pages
│   ├── components/      # React components
│   ├── lib/             # Utilities
│   └── hooks/           # Custom hooks
│
└── docs/                # Documentation
    ├── 01-OVERVIEW.md
    ├── 02-DATABASE.md
    ├── 03-API.md
    ├── 04-FLOWS.md
    └── 05-FRONTEND.md
```
