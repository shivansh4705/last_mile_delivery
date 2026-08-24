# Last-Mile Delivery Tracker Platform 🚚📦

> A last-mile logistics management platform featuring dynamic rate card calculation, volumetric billing engine, admin zone management, intelligent agent auto-assignment, immutable audit tracking history, failed delivery rescheduling flow, and multi-channel notifications.

🌐 **Live Hosted Website (GitHub Pages)**: [https://shivansh4705.github.io/last_mile_delivery/](https://shivansh4705.github.io/last_mile_delivery/)

---

## 🌟 Key Features

1. **Dynamic Rate Calculation Engine**:
   - **Volumetric Weight**: Calculated using formula $(L \times W \times H) / 5000$ (in kg).
   - **Billable Weight**: Billed on higher of actual weight vs volumetric weight.
   - **Zone Engine**: Resolves pickup & drop pincodes to detect `INTRA_ZONE` vs `INTER_ZONE`.
   - **Segmented Rate Cards**: Admin-configurable pricing rules for B2B vs B2C (base rate, base weight allowance, per-kg rate, minimum charge).
   - **COD Surcharges**: Order-type specific cash-on-delivery fees added automatically. Zero hardcoding!

2. **Intelligent Agent Auto-Assignment**:
   - Computes Haversine spatial proximity between driver GPS coordinates and pickup location.
   - Ranks candidate drivers based on zone match, proximity distance, and active workload balancing.

3. **Immutable Tracking Audit Trail & Order Lifecycle**:
   - Full lifecycle: `CREATED` $\rightarrow$ `PENDING_ASSIGNMENT` $\rightarrow$ `ASSIGNED` $\rightarrow$ `PICKED_UP` $\rightarrow$ `IN_TRANSIT` $\rightarrow$ `OUT_FOR_DELIVERY` $\rightarrow$ `DELIVERED` / `FAILED` $\rightarrow$ `RESCHEDULED`.
   - Every status transition creates an immutable record in `OrderTrackingHistory` capturing actor, timestamp, location, and failure notes.

4. **Failed Delivery & Reschedule Workflow**:
   - Driver marks delivery failed with mandatory reason selection.
   - Customer receives automated email/SMS alert with interactive reschedule modal to select new delivery date and slot.
   - Triggers automated driver re-assignment.

5. **Multi-Role Portal**:
   - **Customer**: Book shipments with live cost estimation preview, live visual tracking timeline, reschedule failed deliveries.
   - **Delivery Agent**: View assigned tasks, fast status transition actions, location & availability status toggle.
   - **Admin Command Center**: Executive KPI telemetry, order filter matrix, administrative status override, zone & pincode manager, rate card configurator.
   - **Quick Demo Switcher**: One-click instant role switching bar for evaluation.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, TypeScript, Prisma ORM, SQLite.
- **Frontend**: React (Vite + TypeScript), Vanilla CSS Glassmorphism Design System, Lucide Icons.
- **Testing & Tooling**: TSX, Nodemailer, Archiver script.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ and npm installed.

### Installation & Database Setup

1. **Clone or Extract repository**:
   ```bash
   cd last-mile-delivery-tracker
   ```

2. **Install Root Dependencies**:
   ```bash
   npm run setup
   ```
   *This command will install root, server, and client dependencies, run Prisma migrations, and seed the SQLite database automatically.*

3. **Start Development Servers**:
   ```bash
   npm run dev
   ```
   - **Frontend App**: `http://localhost:5173`
   - **Backend API**: `http://localhost:5000`

---

## 🗄️ Database Schema (Prisma Models)

```prisma
model User {
  id            String    @id @default(uuid())
  name          String
  email         String    @unique
  password      String
  role          String    // ADMIN, CUSTOMER, AGENT
  phone         String?
  currentLat    Float?
  currentLng    Float?
  currentZoneId String?
  isAvailable   Boolean   @default(true)
}

model Zone {
  id          String   @id @default(uuid())
  name        String
  code        String   @unique
  description String?
}

model Area {
  id        String   @id @default(uuid())
  name      String
  pincode   String   @unique
  city      String
  zoneId    String
}

model RateCard {
  id           String   @id @default(uuid())
  orderType    String   // B2B, B2C
  zoneType     String   // INTRA, INTER
  baseWeight   Float    // kg
  baseRate     Float    // $
  perKgRate    Float    // $
  minCharge    Float    // $
  codSurcharge Float    // $
}

model Order {
  id               String   @id @default(uuid())
  trackingNumber   String   @unique
  customerId       String
  agentId          String?
  orderType        String   // B2B, B2C
  paymentType      String   // PREPAID, COD
  pickupAddress    String
  pickupPincode    String
  dropAddress      String
  dropPincode      String
  length           Float
  width            Float
  height           Float
  actualWeight     Float
  volumetricWeight Float
  chargeableWeight Float
  totalCharge      Float
  status           String
  deliveryDate     DateTime?
  scheduledSlot    String?
  failureReason    String?
}

model OrderTrackingHistory {
  id        String   @id @default(uuid())
  orderId   String
  status    String
  actorId   String?
  actorRole String
  actorName String
  location  String?
  notes     String?
  createdAt DateTime @default(now())
}
```

---

## 📐 Rate Calculation Engine Explanation

1. **Volumetric Weight**:
   $$\text{Volumetric Wt (kg)} = \frac{L \text{ (cm)} \times W \text{ (cm)} \times H \text{ (cm)}}{5000}$$
2. **Billable Weight**:
   $$\text{Chargeable Wt} = \max(\text{Actual Weight}, \text{Volumetric Weight})$$
3. **Zone Lookup**:
   - `INTRA_ZONE`: Pickup Pincode Zone == Drop Pincode Zone.
   - `INTER_ZONE`: Pickup Pincode Zone != Drop Pincode Zone.
4. **Rate Card Execution**:
   - Fetches DB rate card matching `(OrderType, ZoneType)`.
   - $\text{Extra Weight} = \max(0, \text{Chargeable Weight} - \text{Base Weight})$
   - $\text{Subtotal} = \max(\text{Min Charge}, \text{Base Rate} + (\text{Extra Weight} \times \text{Per-Kg Rate}))$
   - If Payment Mode is `COD`, adds `RateCard.codSurcharge`.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Role | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Public | User login |
| `POST` | `/api/auth/quick-login` | Public | Demo role quick switcher |
| `GET` | `/api/zones` | Public | List zones and mapped pincodes |
| `POST` | `/api/zones` | Admin | Create zone |
| `POST` | `/api/zones/:zoneId/areas` | Admin | Map area pincode to zone |
| `GET` | `/api/rate-cards` | Public | List all B2B/B2C rate cards |
| `PUT` | `/api/rate-cards/:id` | Admin | Update rate card rules & COD fees |
| `POST` | `/api/rate-cards/preview` | Public | Live pricing preview calculation |
| `POST` | `/api/orders` | Auth | Book new shipment & trigger auto-assign |
| `GET` | `/api/orders` | Auth | List orders (filtered by role/status/zone/agent) |
| `GET` | `/api/orders/:id` | Public | Tracking lookup with audit history |
| `PATCH` | `/api/orders/:id/status` | Agent/Admin | Update shipment status / mark failed |
| `POST` | `/api/orders/:id/reschedule` | Customer | Reschedule failed delivery date |
| `POST` | `/api/orders/:id/assign` | Admin | Trigger driver auto-assignment |
| `PATCH` | `/api/orders/:id/override` | Admin | Administrative status override |
| `GET` | `/api/admin/stats` | Admin | Executive telemetry & KPIs |

---

## 📦 Zip Packaging & Deliverable Generation

To package the entire project into `last-mile-delivery-tracker.zip`:
```bash
npm run zip
```
