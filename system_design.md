# System Design Document: Last-Mile Delivery Management Platform

## 1. Executive Summary & Architecture Overview
The Last-Mile Delivery Platform is engineered to solve core operational complexities in modern logistics: dynamic pricing computation, real-time geographical zone detection, intelligent agent auto-assignment, multi-channel status notifications, and resilient failed-delivery recovery. The platform employs a decoupled REST micro-architecture consisting of a Node.js/TypeScript backend, Prisma ORM with SQLite for deterministic transactional consistency, and a high-performance React (Vite) single-page application.

---

## 2. Rate Calculation Engine Design
Logistics pricing requires dynamic volumetric density adjustments and segment-based rate card lookup without hardcoded business rules.

### A. Mathematical Formulae
1. **Volumetric Weight Calculation**:
   $$\text{Volumetric Weight (kg)} = \frac{\text{Length (cm)} \times \text{Width (cm)} \times \text{Height (cm)}}{5000}$$
2. **Chargeable Billable Weight**:
   $$\text{Chargeable Weight} = \max(\text{Actual Weight}, \text{Volumetric Weight})$$
3. **Zone Pricing Lookup**:
   - **Intra-Zone Shipment**: Pickup Zone ID equals Drop Zone ID ($\text{Zone}_{\text{pickup}} = \text{Zone}_{\text{drop}}$).
   - **Inter-Zone Shipment**: Pickup Zone ID differs from Drop Zone ID ($\text{Zone}_{\text{pickup}} \neq \text{Zone}_{\text{drop}}$).
4. **Base & Incremental Freight Fee**:
   $$\text{Extra Weight} = \max(0, \text{Chargeable Weight} - \text{Base Weight})$$
   $$\text{Freight Charge} = \max\left(\text{Min Charge}, \text{Base Rate} + (\text{Extra Weight} \times \text{Per-Kg Rate})\right)$$
5. **Cash on Delivery (COD) Surcharge**:
   $$\text{COD Fee} = \begin{cases} \text{RateCard.codSurcharge} & \text{if Payment Type} = \text{COD} \\ 0 & \text{if Payment Type} = \text{PREPAID} \end{cases}$$
6. **Total Order Billing**:
   $$\text{Total Charge} = \text{Freight Charge} + \text{COD Fee}$$

### B. Admin Rate Card Flexibility
All rate parameters ($\text{Base Weight}$, $\text{Base Rate}$, $\text{Per-Kg Rate}$, $\text{Min Charge}$, $\text{COD Surcharge}$) are stored in relational database tables indexed by `(orderType, zoneType)` tuples, allowing operations teams to adjust pricing in real-time via the Admin Console without code deployments.

---

## 3. Zone Detection Approach
Geographical zone detection relies on a dynamic Area-Pincode mapping table (`Area` table with `pincode`, `city`, `zoneId`).

### Resolution Pipeline:
1. When an order is created, the engine parses the `pickupPincode` and `dropPincode`.
2. The `RateEngine.detectZoneByPincode(pincode)` function resolves pincodes against mapped administrative zones (`Zone` table).
3. If both pincodes exist in the same zone entity, the route is classified as `INTRA_ZONE`. Otherwise, cross-zone routing defaults to `INTER_ZONE`.
4. Administrators can dynamically map new pincodes to existing or newly created zones via the Zone Management interface.

---

## 4. Intelligent Auto-Assignment Logic & Agent Availability Modelling

### A. Availability Model
Delivery agents (`User` table with `role: AGENT`) maintain:
- `isAvailable` boolean flag (online/offline toggle).
- `currentZoneId` (assigned operating hub).
- `currentLat`, `currentLng` (GPS spatial coordinates).
- `activeWorkload` count of open shipments (`ASSIGNED`, `PICKED_UP`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`).

### B. Assignment Scoring Algorithm
When an order is created or rescheduled, `AssignmentEngine` ranks eligible agents using a composite scoring metric:
$$\text{Score} = \text{Distance}_{\text{Haversine}}(\text{Agent}_{\text{coords}}, \text{Pickup}_{\text{coords}}) + (\text{Active Workload} \times 3) - \text{ZoneMatchBonus}$$

Where Haversine spatial distance is computed as:
$$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$

- **Zone Bonus**: If `Agent.currentZoneId == Order.pickupZoneId`, a -5km penalty reduction is granted.
- The candidate agent with the lowest composite score is assigned automatically, and status updates to `ASSIGNED`. If no available agent is online, the order enters `PENDING_ASSIGNMENT`.

---

## 5. Order Status Lifecycle, Failed Delivery Handling & Audit Immutability

### A. State Machine Lifecycle
```
[CREATED] ──> [PENDING_ASSIGNMENT / ASSIGNED] ──> [PICKED_UP] ──> [IN_TRANSIT]
                                                                        │
[DELIVERED] <── [OUT_FOR_DELIVERY] <─────────────────────────────────────┘
     │                    │
     └── [RESCHEDULED] <── [FAILED (Reason Logged)]
```

### B. Immutable Audit History
State mutations do not mutate past event records. Every status transition appends an immutable row to `OrderTrackingHistory`, capturing `orderId`, `status`, `actorId`, `actorRole` (`SYSTEM`, `ADMIN`, `AGENT`, `CUSTOMER`), `actorName`, `location`, `notes`, and timestamp (`createdAt`).

### C. Failed Delivery Recovery Flow
1. When a delivery attempt fails (e.g., premises locked), the agent sets status to `FAILED` with a compulsory `failureReason`.
2. `NotificationEngine` dispatches an immediate email/SMS alert to the customer.
3. The customer portal renders a "Reschedule Required" banner. The customer selects a new delivery date and time slot.
4. The system updates the order status to `RESCHEDULED`, logs the customer action, and automatically re-invokes the `AssignmentEngine` to assign a driver for the new date attempt.
