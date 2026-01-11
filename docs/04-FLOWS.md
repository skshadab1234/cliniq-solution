# User Flows & Workflows

## Flow 0: User Login & Authorization

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   User opens    │     │  Clerk sign-in  │     │ Backend verify  │
│      app        │────►│  (OTP/email)    │────►│   POST /auth    │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                        ┌────────────────────────────────┼────────────────────────────────┐
                        │                                │                                │
                        ▼                                ▼                                ▼
              ┌─────────────────┐              ┌─────────────────┐              ┌─────────────────┐
              │  User Approved  │              │  User Pending   │              │  User Not Found │
              │   role: doctor  │              │ status: pending │              │   action: join  │
              └────────┬────────┘              └────────┬────────┘              └────────┬────────┘
                       │                                │                                │
                       ▼                                ▼                                ▼
              ┌─────────────────┐              ┌─────────────────┐              ┌─────────────────┐
              │  Issue JWT (7d) │              │  Show "Pending  │              │   Redirect to   │
              │  → Dashboard    │              │   Approval"     │              │   /join page    │
              └─────────────────┘              └─────────────────┘              └─────────────────┘
```

### States
| Status | Access |
|--------|--------|
| `approved` | Full dashboard access based on role |
| `pending` | See "Account pending admin approval" screen |
| `blocked` | See "Account blocked" screen |
| Not found | Redirect to /join registration page |

---

## Flow 1: Start of Day (Assistant)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Assistant opens │     │  POST /queues   │     │ Queue created   │
│   dashboard     │────►│  (auto today)   │────►│  status: open   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │ Yesterday's     │
                                                │ queue auto-     │
                                                │ closed (if any) │
                                                └─────────────────┘
```

### Backend Logic
1. Check if queue exists for today + doctor
2. If exists → return existing queue
3. If not → create new queue, mark yesterday's as closed
4. Return queue with any existing tokens

---

## Flow 2: Patient Arrival (Walk-in)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Patient walks  │     │ Assistant asks  │     │ Assistant adds  │
│   into clinic   │────►│   for name &    │────►│  POST /tokens   │
└─────────────────┘     │     phone       │     └────────┬────────┘
                        └─────────────────┘              │
                                                         ▼
                        ┌─────────────────┐     ┌─────────────────┐
                        │ Patient saved   │◄────│ Token generated │
                        │  to DB (phone   │     │ tokenNumber: 15 │
                        │   as unique ID) │     │ status: waiting │
                        └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │ Return QR code  │
                                                │ or URL for live │
                                                │  queue view     │
                                                └─────────────────┘
```

### Token Number Logic
- Sequential within the day: 1, 2, 3...
- Resets to 1 next day
- Emergency tokens get same number but jump position

---

## Flow 3: Recurring Patient

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Patient gives  │     │ GET /patients   │     │  Patient found  │
│  phone number   │────►│ ?phone=987...   │────►│  in database    │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │ Auto-fill name  │
                                                │ Confirm & add   │
                                                │  to queue       │
                                                └─────────────────┘
```

### UX Benefit
- No re-typing patient details
- Faster check-in
- Historical record preserved

---

## Flow 4: Live Queue Display

```
┌─────────────────────────────────────────────────────────────────┐
│                    LIVE QUEUE DISPLAY                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Currently Serving:  [ Token #6 - John D. ]                   │
│                                                                 │
│   ─────────────────────────────────────────                    │
│                                                                 │
│   Waiting:                                                      │
│     #7  - Sarah M.     (You are here ←)                        │
│     #8  - Mike P.                                               │
│     #9  - Lisa K.                                               │
│     #10 - Emergency Patient ⚡                                  │
│                                                                 │
│   Your position: 1 (Next!)                                      │
│   Estimated wait: ~5 minutes                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Real-time Updates (WebSocket)
```javascript
// Patient's browser connects
socket.on('token:called', ({ tokenNumber }) => {
  if (tokenNumber === myToken) {
    showAlert("Your turn! Please proceed to the doctor's room");
  }
});

socket.on('token:status', ({ tokenId, status }) => {
  updateQueueDisplay();
});
```

---

## Flow 5: Doctor Actions

```
┌─────────────────────────────────────────────────────────────────┐
│                    DOCTOR DASHBOARD                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Current Patient: Token #6 - John Doe                         │
│   Status: In Consultation                                       │
│                                                                 │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│   │             │  │             │  │             │            │
│   │  CALL NEXT  │  │    START    │  │  COMPLETE   │            │
│   │             │  │             │  │             │            │
│   └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                 │
│   Next in queue: Token #7 - Sarah M.                           │
│   Waiting: 4 patients                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Button States

| Current State | Active Button | Action |
|---------------|---------------|--------|
| No patient | CALL NEXT | Calls next waiting token |
| Patient called | START | Marks consultation started |
| In consultation | COMPLETE | Ends consultation |

### State Flow
```
waiting → called → in_progress → completed
            ↓
         skipped (if no response)
```

---

## Flow 6: Exception Handling

### Skip Patient
```
Doctor clicks "Skip" or times out
         │
         ▼
┌─────────────────┐
│ Token status:   │
│ skipped         │
│                 │
│ Auto-call next  │
│ waiting patient │
└─────────────────┘
```

### No-Show
```
Patient doesn't respond after being called
         │
         ▼
┌─────────────────┐
│ Token status:   │
│ no_show         │
│                 │
│ Move to next    │
│ patient         │
└─────────────────┘
```

### Emergency Patient
```
Emergency patient arrives
         │
         ▼
┌─────────────────┐
│ Add with        │
│ isEmergency:    │
│ true            │
│                 │
│ Position: 1     │
│ (top of queue)  │
└─────────────────┘
```

### Pause Queue (Break)
```
Doctor takes break
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ PATCH /queues/  │────►│ Queue status:   │
│ :id/pause       │     │ paused          │
└─────────────────┘     │                 │
                        │ Display shows   │
                        │ "On Break"      │
                        └─────────────────┘
```

---

## Flow 7: Assistant Corrections

### Re-add Skipped Patient
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ View skipped    │     │ PATCH /tokens/  │     │ Token back in   │
│ patients list   │────►│ :id/readd       │────►│ queue at end    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Cancel Token
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Patient leaves  │     │ DELETE /tokens/ │     │ Token removed   │
│ or requests     │────►│ :id             │────►│ from queue      │
│ cancellation    │     └─────────────────┘     └─────────────────┘
└─────────────────┘
```

### Manual Reorder
```
┌─────────────────┐     ┌─────────────────┐
│ Drag & drop     │     │ PATCH /tokens/  │
│ token in list   │────►│ :id/position    │
│                 │     │ { position: 3 } │
└─────────────────┘     └─────────────────┘
```

---

## Flow 8: Patient Experience

### Patient View (No Login)
```
Patient receives:
  - SMS with link (future)
  - QR code from assistant
  - URL: app.com/q/{token-id}
         │
         ▼
┌─────────────────────────────────────────┐
│         Your Token: #8                  │
│                                         │
│  Currently serving: #6                  │
│  Your position: 2                       │
│  Estimated wait: ~10 min                │
│                                         │
│  ━━━━━━━━━━░░░░░░░░░░  (progress bar)  │
│                                         │
│  Status: Waiting                        │
│  [Auto-refresh enabled]                 │
└─────────────────────────────────────────┘
```

### Notifications
| Event | Display |
|-------|---------|
| 1 position away | "You're next! Please be ready" |
| Being called | "Your turn! Please proceed" |
| Skipped | "You were skipped. Ask reception." |

---

## Flow 9: End of Day

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Assistant/Doc   │     │ PATCH /queues/  │     │ Queue closed    │
│ closes queue    │────►│ :id/close       │────►│ Stats logged    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │ Summary:        │
                                                │ - Total: 25     │
                                                │ - Completed: 22 │
                                                │ - No-show: 3    │
                                                └─────────────────┘
```

### Auto-close
- Yesterday's queue auto-closes when today's opens
- Remaining waiting tokens marked as "cancelled"

---

## Flow 10: Admin Management

### Approve User
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Admin sees      │     │ Select role:    │     │ PATCH /admin/   │
│ pending users   │────►│ doctor or       │────►│ users/:id/      │
│                 │     │ assistant       │     │ approve         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Assign Doctor to Clinic
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Select clinic   │     │ Select doctor   │     │ POST /admin/    │
│                 │────►│ (approved)      │────►│ clinic-doctors  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Assign Assistant to Doctor
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ Select doctor   │     │ Select          │     │ POST /admin/    │
│                 │────►│ assistant       │────►│ doctor-         │
│                 │     │ (approved)      │     │ assistants      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```
