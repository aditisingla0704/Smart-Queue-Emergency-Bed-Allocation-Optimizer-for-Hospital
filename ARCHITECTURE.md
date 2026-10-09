# MedQueue System Architecture & Viva Preparation Guide

This document provides a technical walkthrough of the design choices, algorithmic formulations, data relationships, and viva answers for the MedQueue system.

---

## 1. High-Level System Architecture

MedQueue is designed as a role-based clinical workflow orchestrator and constrained resource optimization platform:

```
[ Clients / Role UI ]
   ├── Triage Nurse   -> Registration, Vitals, ESI 1-5 Acuity Entry
   ├── Emergency MD   -> Queued View, Status Update, Bed Request
   ├── Bed Manager    -> Bed Board, Optimizer Suggestions, Overrides
   └── Administrator  -> Ward Setup, Surge Config, Audit, Comparison
            │
            ▼ (Next.js 15 App Router & Server Handlers)
[ RBAC & Validation Layer ]
   ├── NextAuth JWT Session Verification
   ├── Zod Schema Enforcement (Payload Sanitization)
   └── Audit Logging (Action, Entity, User ID, Timestamp)
            │
            ▼
[ Algorithmic Engine (Pure TypeScript) ]
   ├── Priority Scoring Engine (Formula with Triage + Aging + Flags)
   ├── Constrained Matching Validator (Hard Constraints)
   └── Assignment Solvers (Hungarian Min-Cost vs Greedy Comparison)
            │
            ▼
[ Persistence & Data Layer ]
   └── SQLite Database (via Prisma ORM, Zero Leakage of Simulation Data)
```

---

## 2. Priority Queue Algorithm & Scoring Formula

### Mathematical Formulation

$$\text{Priority Score} = \text{TriageWeight} + \text{AgingFactor} + \text{FlagBonus}$$

Where:

1. **Triage Urgency Weight**:
   - **Level 1 (Resuscitation)**: Direct bypass score = **1000** (preempts all queues immediately)
   - **Level 2 (Emergent)**: $80$
   - **Level 3 (Urgent)**: $60$
   - **Level 4 (Less Urgent)**: $40$
   - **Level 5 (Non-Urgent)**: $20$

2. **Aging Factor (Anti-Starvation)**:
   $$\text{AgingFactor} = \min(\text{waitMinutes} \times 0.5,\, 30)$$
   - Patients gain $+0.5$ priority points for every minute waiting.
   - Capped at $+30$ points so lower-acuity patients are systematically advanced over time without ever preempting emergent resuscitation patients.

3. **Clinical Vulnerability Flags**:
   - Pediatric ($\text{age} < 14$): $+5$ points
   - Pregnancy: $+5$ points
   - Infection Risk: $+3$ points

### Dynamic Wait Time Estimation

Rather than arbitrary hardcoded estimates, wait times are calculated dynamically based on real clinical throughput:

$$\text{Estimated Wait} = \text{Queue Position} \times \left(\frac{1}{N}\sum_{i=1}^{N} \text{ServiceTime}_i\right)$$

Where service times are measured from recent patient transitions (`seenAt - queuedAt`), falling back to a 15-minute standard baseline only if no historical records exist.

---

## 3. Bed Allocation Optimizer

Bed allocation is framed as a **Constrained Bipartite Min-Cost Matching Problem**:

### A. Hard Constraints (Must Be Satisfied)
1. **Ward Type**: Patient required ward must match bed ward category.
2. **Isolation Guarantee**: If `isolationNeed == true`, the target bed must have `isIsolation == true`.
3. **Equipment Availability**: Every piece in `patient.requiredEquipment` (e.g., ventilator, cardiac monitor, oxygen) must be present on the target bed.
4. **Gender Policy**: If the room is shared and marked `SAME_GENDER`, the bed's current occupant gender must match the incoming patient's gender. Single/unrestricted rooms allow any gender.
5. **Bed Operability**: Target bed status must strictly be `AVAILABLE` (rejects `OCCUPIED`, `CLEANING`, `RESERVED`, `OUT_OF_SERVICE`).

### B. Soft Objectives & Cost Function
For candidate assignments that satisfy all hard constraints:

$$\text{Cost}(p, b) = \max(0, 100 - \text{Score}_p) - (0.5 \times \text{Wait}_p) + \text{ReservePenalty} - \text{EquipmentBonus}$$

- **Reserve Penalty**: If assigning an ICU bed leaves fewer than the configured reserve threshold (default 2 beds free), $+50$ penalty is added.
- **Equipment Bonus**: $-5$ cost reduction per extra relevant medical device present.
- **Wait Time Factor**: Decreases cost for longer-waiting patients to expedite their allocation.

### C. Solvers: Hungarian Algorithm vs Greedy Baseline

1. **Hungarian Algorithm (Kuhn-Munkres)**:
   - Constructs a cost matrix between $M$ patients and $N$ beds.
   - Rectangular matrices are padded to $K \times K$ with dummy entries.
   - Uses dual potentials and augmenting path searches to guarantee the mathematically global minimum total cost across all concurrent assignments in $O(V^3)$ time.
2. **Greedy Baseline**:
   - Sorts patients strictly by priority descending.
   - Assigns the local highest-scoring available bed for each patient sequentially.
   - May deplete optimal resources early, resulting in higher overall wait times or unassigned patients downstream.

Both algorithms run side-by-side in the **Optimizer Comparison** dashboard, demonstrating the measurable advantage of global cost minimization.

---

## 4. Key Viva Questions & Answers

### Q1: Why should the system never make clinical diagnoses?
**Answer**: MedQueue is an operational queue and resource optimizer, not a diagnostic medical device (SaMD). Triage levels are entered by licensed triage nurses using validated clinical protocols (e.g., ESI). The software acts as a decision support system that optimizes resource matching while keeping human clinicians fully in control.

### Q2: How does the priority queue prevent lower-acuity patients from starving?
**Answer**: Through the linear aging factor $+0.5 \times \text{waitMinutes}$, capped at $+30$. Over time, a Level 4 patient waiting for 60 minutes will advance ahead of newly arriving Level 4 and Level 5 arrivals, ensuring fair progression while preserving safety for Level 1 and 2 arrivals.

### Q3: What is the difference between Hungarian matching and Greedy assignment?
**Answer**: Greedy allocation is locally optimal; it takes the best bed for the first patient, potentially consuming an isolated or ventilator bed needed by a subsequent patient. The Hungarian algorithm computes the global minimum cost across the entire bipartite graph, ensuring the greatest overall clinical utility and fewest unassigned high-acuity patients.

### Q4: How is data integrity preserved between simulation and clinical operations?
**Answer**: All simulated records carry `isSimulation: true`. All production database queries, live queues, bed board grids, and operational report endpoints enforce `where: { isSimulation: false }`. Simulation mode runs in an isolated sandbox for testing and viva demonstration.
