# Auto-Confirmation & 90-Minute Non-Overlapping Seating Engine

Transition the reservation booking engine to automatically accept and confirm bookings without requiring admin approval whenever a room has space within its 5-seat limit, and restructure available seating times to 90-minute non-overlapping intervals per dining room.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following user preferences were confirmed in Phase 1 and govern this implementation:
>
> - **Automatic Acceptance Policy**: All eligible reservations within the 5-seat dining room capacity will immediately be saved with `status: 'confirmed'`, granting instant guest confirmation without administrative triage.
> - **90-Minute Seating Structure**: Available seating times will be arranged in clean 90-minute staggered intervals per individual dining room (e.g. 17:00–18:30, 18:30–20:00, 20:00–21:30), eliminating overlapping dining windows for any room.
> - **Capacity Enforcement**: The 5-seat capacity limit applies strictly per individual dining room/table, ensuring intimate dining allocations and preventing double-booking.

---

## 1. Overview & Core Concept

- **What It Does**: Guests booking a dining room or table online with a party size of up to 5 receive immediate, automatic reservation confirmation as long as the selected room is available. The available seating slot generator enforces strict 90-minute non-overlapping session blocks per room.
- **Target Audience**: Dining guests reserving tables online who expect instant booking confirmation, and restaurant staff who no longer need to manually confirm each incoming booking.
- **Key Value**: Eliminates administrative delay in confirming guest reservations while mathematically guaranteeing zero room/table overlaps through synchronized 90-minute seating blocks and real-time conflict checking.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Party Size Selection (Step 1)**: Guest selects party size (1 to 5 guests). Selecting $> 5$ triggers immediate `"Limit exceeded"` guidance.
  2. **Evening & Non-Overlapping Time Slot Selection (Step 2)**: Guest selects a date. The UI presents clean, non-overlapping 90-minute seating session slots (e.g., 17:00, 18:30, 20:00, 21:30) per room. Any slot already holding a confirmed reservation displays `"Reserved"` / `"Limit Exceeded"` and cannot be double-booked.
  3. **Instant Confirmation Booking (Step 3 & 4)**: Guest enters contact details and submits. The booking is instantly confirmed (`status: 'confirmed'`). The completion screen displays an immediate green confirmation badge, assigned room name, and calendar download (.ics).
  4. **Admin Dashboard Experience**: The administrative portal displays auto-confirmed reservations directly in the active confirmed roster, with options to reassign rooms, mark as seated/completed, or cancel.

- **Visual Identity & Theme**:
  - Deep obsidian and charcoal background (`#090a0d`, `#12141c`) with warm gold and amber accents (`#c59b43`, `#e8c782`).
  - Clean unboxed metadata separated by typographic dots (`·`).
  - Clear state badges: emerald (`Confirmed · Automatic`), amber (`Reserved`), and rose (`Limit Exceeded`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Immediate Auto-Confirmation (`pending` $\to$ `confirmed`)**
  - *Chosen Approach*: On valid submission with an unreserved room and party size $\le 5$, the reservation payload is persisted directly with `status: 'confirmed'`.
  - *Why*: Removes unnecessary friction and waiting for the customer, meeting modern reservation expectations.
  - *Alternatives Considered*: Retaining a draft/pending state required manual admin clicks for every reservation, causing drop-offs and uncertainty.

- **Decision 2: 90-Minute Discrete Seating Intervals**
  - *Chosen Approach*: Change `slot_interval_minutes` from 30 to 90 minutes in configuration and slot generation algorithm.
  - *Why*: A 90-minute reservation duration paired with a 90-minute slot interval creates discrete, contiguous dining sessions per room without overlapping time spans.
  - *Alternatives Considered*: 30-minute intervals caused bookings at 17:00 to block 17:30 and 18:00, creating customer confusion over why adjacent slots disappeared.

- **Decision 3: Room-Level 5-Seat Maximum**
  - *Chosen Approach*: Enforce max capacity of 5 seats per individual room/table.
  - *Why*: Directly aligns with user preference and physical room sizes while upholding the double-booking invariant.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Guest Booking Interface                         │
│  [Step 1: Party (1-5)] ──> [Step 2: 90-Min Slots] ──> [Step 3: Details]│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Submit Booking
                                    v
┌────────────────────────────────────────────────────────────────────────┐
│                        Data Service Validation                         │
│  1. Check Party Size <= 5 per Room                                     │
│  2. Double-Booking Overlap Check: (reqStart < resEnd && reqEnd > resStart)
│  3. Auto-Accept: Set status = 'confirmed'                              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                  ┌─────────────────┴─────────────────┐
                  v                                   v
    ┌───────────────────────────┐       ┌───────────────────────────┐
    │     Supabase / Postgres   │       │   Local Storage Fallback  │
    │  - INSERT status='confirmed'       │  - Save with 'confirmed'  │
    │  - Trigger Double-Check   │       │  - Immediate UI dispatch  │
    └───────────────────────────┘       └───────────────────────────┘
```

- **Data Model Updates**:
  - `RestaurantSettings`: Set `default_reservation_duration_minutes = 90` and `slot_interval_minutes = 90`.
  - `createReservation`: Payload default `status: 'confirmed'` (auto-accepted).
  - `getAvailableTimeSlots`: Generate 90-minute non-overlapping intervals per room throughout operational hours.
  - `supabase-schema.sql`: Ensure defaults and triggers reflect auto-confirmed status and 90-minute intervals.
- **Repository Hygiene**:
  - Remove accidental merge conflict marker from `README.md`.
  - Keep `.env.example` clean without real API secrets.

---

## 5. Implementation Steps (Upon Approval)

1. **Update `data-service.ts` Configuration & Algorithms**:
   - Set default slot interval to 90 minutes and reservation duration to 90 minutes.
   - Update `createReservation` to automatically assign `status: 'confirmed'` upon successful validation.
   - Update `getAvailableTimeSlots` to iterate in 90-minute non-overlapping session blocks per dining room.
2. **Update Public UI (`ReservationSection.tsx`)**:
   - Update step messaging to reflect instant auto-confirmation.
   - Render 90-minute session blocks (e.g., 17:00–18:30, 18:30–20:00) with clear room allocations.
   - Display confirmed status badge and confirmation summary in Step 4.
3. **Update Admin Settings & Schemas**:
   - Update default parameters in `SettingsView.tsx` and `supabase-schema.sql`.
   - Update `Architecture and decisions.md` and clean up `README.md` conflict marker.
4. **Verification**:
   - Run `lint_applet` and `compile_applet`.
   - Test that concurrent requests for the same room block overlapping 90-minute windows.
