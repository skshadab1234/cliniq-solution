# Frontend Architecture

## Page Structure

```
/frontend/app/
├── layout.tsx                 # Root layout with Clerk
├── page.tsx                   # Landing page
│
├── (auth)/
│   ├── sign-in/[[...sign-in]]/page.tsx   # Clerk sign-in
│   ├── pending/page.tsx                   # "Account pending approval"
│   └── blocked/page.tsx                   # "Account blocked"
│
├── (dashboard)/
│   ├── layout.tsx             # Dashboard layout (sidebar + header)
│   │
│   ├── assistant/
│   │   ├── page.tsx           # Main queue management
│   │   └── patients/page.tsx  # Patient search & history
│   │
│   ├── doctor/
│   │   └── page.tsx           # 3-button interface
│   │
│   └── admin/
│       ├── page.tsx           # Admin overview
│       ├── users/page.tsx     # User approval
│       └── assignments/page.tsx # Clinic-doctor assignments
│
├── join/
│   └── page.tsx               # Registration request form
│
└── q/
    └── [tokenId]/page.tsx     # Public patient queue view
```

---

## Component Hierarchy

### Shared Components
```
/components/
├── Header.tsx                 # Navigation bar
├── Sidebar.tsx                # Dashboard sidebar (role-aware)
├── LoadingSpinner.tsx         # Loading state
│
├── ui/                        # Shadcn components
│   ├── button.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   └── ...
│
├── queue/                     # Queue-specific components
│   ├── QueueDisplay.tsx       # Live queue list
│   ├── TokenCard.tsx          # Single token display
│   ├── AddPatientModal.tsx    # Add walk-in patient
│   ├── PatientSearch.tsx      # Search by phone
│   ├── QueueStats.tsx         # Queue statistics
│   └── QueueControls.tsx      # Pause/Resume/Close
│
├── doctor/
│   ├── DoctorControls.tsx     # Call/Start/Complete buttons
│   └── CurrentPatient.tsx     # Current patient display
│
├── patient/
│   ├── PatientQueueView.tsx   # Public queue display
│   └── TokenStatus.tsx        # Patient's token status
│
└── admin/
    ├── UserApprovalTable.tsx  # Pending users list
    ├── UserRoleSelect.tsx     # Role dropdown
    └── AssignmentManager.tsx  # Clinic/Doctor assignments
```

---

## Page Specifications

### 1. Assistant Dashboard (`/assistant`)

**Purpose:** Main queue management interface

**Layout:**
```
┌────────────────────────────────────────────────────────────────────┐
│ [Sidebar]  │  QUEUE MANAGEMENT                    [Pause] [Close]  │
│            │───────────────────────────────────────────────────────│
│ Dashboard  │                                                        │
│ Patients   │  [ + Add Patient ]    [ Search by Phone: ________ ]   │
│            │                                                        │
│            │  ┌─────────────────────────────────────────────────┐  │
│            │  │ CURRENT: Token #6 - John Doe (In Progress)      │  │
│            │  └─────────────────────────────────────────────────┘  │
│            │                                                        │
│            │  WAITING (5)                                          │
│            │  ┌────────┬──────────────┬──────────┬─────────────┐   │
│            │  │ Token  │ Patient      │ Status   │ Actions     │   │
│            │  ├────────┼──────────────┼──────────┼─────────────┤   │
│            │  │ #7     │ Sarah M.     │ Waiting  │ [Skip][Del] │   │
│            │  │ #8 ⚡  │ Emergency    │ Waiting  │ [Skip][Del] │   │
│            │  │ #9     │ Mike P.      │ Waiting  │ [Skip][Del] │   │
│            │  └────────┴──────────────┴──────────┴─────────────┘   │
│            │                                                        │
│            │  COMPLETED TODAY: 12  │  NO-SHOW: 2  │  SKIPPED: 1    │
└────────────┴────────────────────────────────────────────────────────┘
```

**State:**
```typescript
interface AssistantDashboardState {
  queue: Queue | null;
  tokens: Token[];
  isLoading: boolean;
  isAddModalOpen: boolean;
  searchPhone: string;
  searchResult: Patient | null;
}
```

**Key Actions:**
- Add patient (modal with name/phone)
- Search patient by phone
- Skip patient
- Mark no-show
- Re-add skipped patient
- Cancel token
- Pause/Resume queue
- Close queue

---

### 2. Doctor Dashboard (`/doctor`)

**Purpose:** Minimal 3-button interface

**Layout:**
```
┌────────────────────────────────────────────────────────────────────┐
│                        DR. SMITH - TODAY'S QUEUE                   │
│────────────────────────────────────────────────────────────────────│
│                                                                     │
│                    CURRENT PATIENT                                  │
│          ┌─────────────────────────────────────────┐               │
│          │                                         │               │
│          │         Token #6                        │               │
│          │         John Doe                        │               │
│          │         Status: In Consultation         │               │
│          │                                         │               │
│          └─────────────────────────────────────────┘               │
│                                                                     │
│    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│    │              │  │              │  │              │           │
│    │  CALL NEXT   │  │    START     │  │   COMPLETE   │           │
│    │              │  │              │  │              │           │
│    │   (Token 7)  │  │              │  │              │           │
│    └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                     │
│                                                                     │
│    Next: Token #7 - Sarah M.          Waiting: 4 patients          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Button Logic:**
| State | Call Next | Start | Complete |
|-------|-----------|-------|----------|
| No current patient | Enabled | Disabled | Disabled |
| Patient called | Disabled | Enabled | Disabled |
| In consultation | Disabled | Disabled | Enabled |

---

### 3. Patient Queue View (`/q/[tokenId]`)

**Purpose:** Public view for patients (no login)

**Layout (Mobile-first):**
```
┌─────────────────────────────┐
│       City Clinic           │
│       Dr. Smith             │
├─────────────────────────────┤
│                             │
│      YOUR TOKEN             │
│          #8                 │
│                             │
│   ━━━━━━━░░░░░░░ 70%       │
│                             │
│   Currently serving: #6     │
│   Your position: 2          │
│                             │
│   ⏱ Est. wait: ~10 min     │
│                             │
├─────────────────────────────┤
│   Status: WAITING           │
│                             │
│   Updates automatically     │
│   [🔔 Enable notifications] │
│                             │
└─────────────────────────────┘
```

**States:**
| Status | Display |
|--------|---------|
| waiting | Position + ETA |
| called | "YOUR TURN! Please proceed" (green) |
| in_progress | "In consultation" |
| completed | "Thank you for visiting" |
| skipped | "You were skipped. Please see reception." |

---

### 4. Admin Panel (`/admin`)

**Purpose:** User approval and assignments

**Layout:**
```
┌────────────────────────────────────────────────────────────────────┐
│ [Sidebar]  │  ADMIN PANEL                                          │
│            │───────────────────────────────────────────────────────│
│ Users      │                                                        │
│ Assignments│  PENDING APPROVALS (3)                                │
│            │  ┌────────────────────────────────────────────────┐   │
│            │  │ Name          │ Email         │ Role   │ Action│   │
│            │  ├───────────────┼───────────────┼────────┼───────┤   │
│            │  │ Dr. New       │ new@mail.com  │ [▼]    │[✓][✗] │   │
│            │  │ Jane Assist   │ jane@mail.com │ [▼]    │[✓][✗] │   │
│            │  └───────────────┴───────────────┴────────┴───────┘   │
│            │                                                        │
│            │  ACTIVE USERS                                         │
│            │  ┌────────────────────────────────────────────────┐   │
│            │  │ Name          │ Role      │ Status  │ Actions │   │
│            │  ├───────────────┼───────────┼─────────┼─────────┤   │
│            │  │ Dr. Smith     │ Doctor    │ Active  │ [Block] │   │
│            │  │ Mary Assist   │ Assistant │ Active  │ [Block] │   │
│            │  └───────────────┴───────────┴─────────┴─────────┘   │
└────────────┴────────────────────────────────────────────────────────┘
```

---

### 5. Pending Approval Page (`/pending`)

**Purpose:** Show when user's account is pending

**Layout:**
```
┌─────────────────────────────────────────────┐
│                                             │
│              ⏳                              │
│                                             │
│     Account Pending Approval                │
│                                             │
│     Your registration request has been      │
│     submitted. An administrator will        │
│     review and approve your account.        │
│                                             │
│     You'll receive an email once            │
│     approved.                               │
│                                             │
│         [Check Status]  [Sign Out]          │
│                                             │
└─────────────────────────────────────────────┘
```

---

## State Management

### Global State (React Context)
```typescript
// AuthContext - User authentication state
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// QueueContext - Real-time queue state
interface QueueState {
  queue: Queue | null;
  tokens: Token[];
  currentToken: Token | null;
  socket: Socket | null;
}
```

### Socket Integration
```typescript
// hooks/useSocket.ts
export function useSocket(queueId: string) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io(BACKEND_URL, {
      query: { queueId }
    });

    s.on('token:called', handleTokenCalled);
    s.on('token:status', handleTokenStatus);
    s.on('queue:update', handleQueueUpdate);

    setSocket(s);
    return () => s.disconnect();
  }, [queueId]);

  return socket;
}
```

---

## API Client

```typescript
// lib/api.ts
const api = {
  // Auth
  verify: (clerkId: string) => post('/auth/verify', { clerkId }),

  // Queues
  getTodayQueue: () => get('/queues/today'),
  createQueue: (data) => post('/queues', data),
  pauseQueue: (id) => patch(`/queues/${id}/pause`),
  resumeQueue: (id) => patch(`/queues/${id}/resume`),
  closeQueue: (id) => patch(`/queues/${id}/close`),

  // Tokens
  addToken: (data) => post('/tokens', data),
  skipToken: (id) => patch(`/tokens/${id}/skip`),
  noShowToken: (id) => patch(`/tokens/${id}/noshow`),
  readdToken: (id) => patch(`/tokens/${id}/readd`),
  cancelToken: (id) => del(`/tokens/${id}`),

  // Doctor actions
  callNext: () => post('/doctor/call-next'),
  startConsultation: () => post('/doctor/start'),
  completeConsultation: () => post('/doctor/complete'),

  // Patients
  searchPatient: (phone) => get(`/patients?phone=${phone}`),

  // Public
  getPublicQueue: (id) => get(`/public/queue/${id}`),
  getTokenStatus: (id) => get(`/public/token/${id}`),

  // Admin
  getPendingUsers: () => get('/admin/users?status=pending'),
  approveUser: (id, role) => patch(`/admin/users/${id}/approve`, { role }),
  blockUser: (id) => patch(`/admin/users/${id}/block`),
};
```

---

## Styling Guidelines

### Color Palette
```css
:root {
  --primary: #2563eb;      /* Blue - primary actions */
  --success: #16a34a;      /* Green - completed/success */
  --warning: #ca8a04;      /* Yellow - waiting/pending */
  --danger: #dc2626;       /* Red - errors/cancel */
  --emergency: #ea580c;    /* Orange - emergency */

  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
}
```

### Token Status Colors
| Status | Color | Badge |
|--------|-------|-------|
| waiting | Yellow | `bg-yellow-100 text-yellow-800` |
| called | Blue | `bg-blue-100 text-blue-800` |
| in_progress | Purple | `bg-purple-100 text-purple-800` |
| completed | Green | `bg-green-100 text-green-800` |
| skipped | Gray | `bg-gray-100 text-gray-800` |
| no_show | Red | `bg-red-100 text-red-800` |
| emergency | Orange | `bg-orange-100 text-orange-800` |

### Responsive Breakpoints
```css
/* Mobile first */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
```
