# MedQueue

> Smart Queue and Emergency Bed Allocation Optimizer for Hospitals.

MedQueue is a full-stack clinical decision support web application built to streamline patient intake, dynamically prioritize queue progression, and optimize emergency bed allocations across wards.

---

## Key Features

1. **Smart Clinical Priority Queue**:
   - Triage scoring using a 5-level scale (ESI 1-5 entered by triage nurses; system never diagnoses).
   - Priority formula: Triage weight + linear aging factor (+0.5 pt/min, max 30 pts) + clinical vulnerability flags (pediatric, pregnancy, infection).
   - Emergency Level 1 patients bypass waitlists directly (score 1000).
   - Dynamic wait time estimation calculated from recent actual patient throughput.

2. **Emergency Bed Allocation Optimizer**:
   - Solves constrained matching across ER, General, ICU, Isolation, Pediatric, and Maternity wards.
   - Enforces hard constraints: ward category, isolation rooms, equipment matching (ventilator, monitor, oxygen), bed maintenance states, and shared-room gender policies.
   - Dual algorithms: **Hungarian Algorithm (Kuhn-Munkres)** for global min-cost matching vs. **Greedy Baseline**.
   - Admin comparison dashboard demonstrating algorithmic performance.
   - Every recommendation generated with plain-language explanations.
   - Bed managers confirm or override recommendations (with mandatory override rationale logging).

3. **Live Bed Board & Surge Capacity Management**:
   - Status indicators across all wards: Available, Occupied, Cleaning, Reserved, Out of Service.
   - Configurable surge thresholds per ward with automatic alert banners and discharge/overflow recommendations.

4. **Role-Based Access Control (RBAC)**:
   - **Triage Nurse**: Patient intake registration, vitals recording, triage level entry.
   - **Doctor**: Queue inspection, status progression, admission requests.
   - **Bed Manager**: Live bed board, review optimizer suggestions, accept/override assignments.
   - **Admin**: Ward management, audit log inspection, simulation sandboxing, report analytics.

5. **Simulation Mode**:
   - Admin sandbox generating synthetic arrivals for stress-testing and viva demonstrations.
   - Strict data isolation: simulated entries are tagged `isSimulation: true` and excluded from operational views.

6. **Full Audit Trail & Database Reports**:
   - Immutable audit logging for patient status transitions, bed reallocations, and manual overrides.
   - Reports calculated directly from database records: average wait by triage level, ward occupancy, and override rates.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router) + TypeScript
- **Styling**: Tailwind CSS (accessible healthcare palette: deep teal `#0D6E6E`, neutral grays, standard status colors)
- **Icons**: Lucide React (no emojis)
- **Database**: SQLite with Prisma ORM (configurable to PostgreSQL via `.env`)
- **Authentication**: NextAuth.js v5 with credentials and `bcryptjs` password hashing
- **Validation**: Zod
- **Testing**: Vitest unit test suite

---

## Getting Started

### 1. Clone & Install Dependencies

```bash
git clone <repo-url>
cd medqueue
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Default local database connection uses SQLite (`file:./dev.db`).

### 3. Setup Database & Seed Sample Records

```bash
# Push Prisma schema to SQLite
npm run db:push

# Seed users, wards, beds, and initial sample patients
npm run db:seed
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Default Login Credentials (Seeded Demo Accounts)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@medqueue.local` | `password123` |
| Triage Nurse | `nurse@medqueue.local` | `password123` |
| Doctor | `doctor@medqueue.local` | `password123` |
| Bed Manager | `bedmanager@medqueue.local` | `password123` |

*Note: All demo records are clearly labeled as "Sample data" in the interface.*

---

## Testing & Verification

Run the test suite:

```bash
npm test
```

Execute a production build:

```bash
npm run build
```

---

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md): Mathematical formulations, priority queue algorithm, Hungarian algorithm implementation, and viva prep guide.
- [DEPLOYMENT.md](./DEPLOYMENT.md): Step-by-step production deployment guide, custom domain setup, Nginx reverse proxy, and SSL/HTTPS.
