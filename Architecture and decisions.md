# Architecture and Decisions

## C03 Part A — AS-IS map of Confirm Reservation

Code references are to commit `094536d` of `main`. Line numbers will drift, so update them if the files change.

> **Fill in before submitting:** items marked `TODO` need information from Specification Baseline v0.2, which is not in the repository. Run the app once and add at least one runtime observation to the evidence in A2/A3.

---

## A1. Scenario

| Item | Value |
|------|-------|
| Scenario / operation | Confirm Reservation |
| Requirements | TODO: REQ-xx from v0.2 |
| Rules / invariants | TODO: BR-xx from v0.2 (no overlapping bookings for the same table) |
| Baseline | v0.2 |

---

---

## A2. Main scenario path → code

| C03 scenario step | Implementation location | Evidence |
|---|---|---|
| Request reservation booking | Public user selects 90-minute slot (within 5-seat capacity) and submits guest details | `src/components/public/ReservationSection.tsx` L590–L770 |
| Pre-insert overlap validation | `createReservation` calculates `targetStart < rEnd && targetEnd > rStart` for the same room; rejects if overlapping | `src/lib/data-service.ts` L543–L578 |
| Automatic Confirmation | If room capacity is available ($\le 5$ guests) and no overlap, status is directly set to `'confirmed'` (no manual admin action needed) | `src/lib/data-service.ts` L578–L585; `ReservationSection.tsx` L638–L644 |
| Persist result | Supabase `.from('reservations').insert({... status: 'confirmed' })` or fallback `localStorage` | `src/lib/data-service.ts` L586–L620 |
| Double-booking database guard | PostgreSQL trigger `trigger_prevent_table_double_booking` runs before insert/update, raising exception on overlap | `supabase-schema.sql` L84–L110 |
| Update the UI | Returns confirmed reservation immediately; renders Step 4 confirmation card with `STATUS: CONFIRMED · AUTO-ACCEPTED` | `ReservationSection.tsx` L773–L852 |

## A3. Alternative / failure path: conflict exists → confirmation is rejected

| Behavior | Where condition is detected | Where outcome is decided | What caller receives |
|---|---|---|---|
| Double-booking attempted for same dining room & overlapping time | In `createReservation` pre-check AND Postgres trigger `prevent_table_double_booking()` | Data service / DB trigger | Throws error: `"Double-booking is not possible: This dining room is already booked for this date and time."` UI catches and displays alert with prompt to pick another time slot. |
| Dining limit exceeded (> 5 guests or > 5 reservations per slot) | In `getAvailableTimeSlots` and `createReservation` | UI & Data service | Marks slot as `isLimitExceeded: true`, disables selection, and displays `"Limit exceeded: Maximum 5 seats per dining room."` |

---

## A4. Main implementation elements

| Implementation element | Type / contents | Role in this scenario | Evidence |
|---|---|---|---|
| Public reservation UI | Component `ReservationSection.tsx` | Presents 90-minute non-overlapping slots per room, guest form, and instant confirmation | `ReservationSection.tsx` |
| Admin reservations UI | Component `ReservationsView.tsx` | Displays auto-confirmed reservations, filter by date/status, cancel/complete management | `ReservationsView.tsx` |
| App state handler | `App.tsx`: `handleCreateReservation`, `handleUpdateReservationStatus` | Coordinates state sync, notifications, and views | `App.tsx` |
| Data service | Module `data-service.ts`: `getAvailableTimeSlots`, `createReservation`, `getReservations` | Generates 90-minute staggered slots per room, enforces 5-seat capacity limit, performs overlap checks, auto-assigns status `'confirmed'` | `data-service.ts` |
| Supabase client & DB trigger | `supabase.ts` + `supabase-schema.sql` | Postgres storage with `trigger_prevent_table_double_booking` enforcing no concurrent overlaps | `supabase-schema.sql` L84–L110 |

---

## A5. State, state change, and one rule

### State

| Question | Answer | Evidence |
|---|---|---|
| Where is Reservation state persisted? | Postgres table `reservations`, column `status` (`confirmed`, `cancelled`, `completed`). Fallback in browser `localStorage` under `STORAGE_KEYS.RESERVATIONS`. In-memory state in `App.tsx` | `supabase-schema.sql`; `data-service.ts`; `App.tsx` |
| Which code decides/executes the transition? | `createReservation` automatically sets `status: 'confirmed'` on creation once room availability ($\le 5$ seats) and non-overlapping time window are verified | `data-service.ts` L578–L585 |

### Business rule: a room must not be booked for overlapping times (90-minute non-overlapping intervals)

| Question | Answer | Evidence |
|---|---|---|
| Where is the rule condition detected? | 1. In `getAvailableTimeSlots`: iterates in 90-minute increments per dining room, checking `target_start < rEnd && target_end > rStart`.<br>2. In `createReservation`: re-checks overlap against all active bookings.<br>3. In PostgreSQL: trigger `prevent_table_double_booking` checks before insert. | `data-service.ts` L638–L725; `supabase-schema.sql` L86–L105 |
| Where is the outcome decided? | Overlapping slots are omitted from user choices. If a race condition occurs, `createReservation` or the DB trigger aborts insertion. | `data-service.ts` L690–L720, L550–L575 |
| How are 90-minute seating times structured? | Each dining room operates on dedicated 90-minute staggered intervals (e.g., Room 1 at 17:00–18:30, 18:30–20:00, 20:00–21:30; Room 2 at 17:15–18:45, etc.), guaranteeing mathematical zero-overlap for any individual dining room. | `data-service.ts` L650–L690 |

---

## A6. Dependencies

| Dependency | Where it connects to your code | Which part knows its technical API | Evidence |
|---|---|---|---|
| Supabase Postgres (`reservations`, `restaurant_tables`, and others) | `.from('reservations')` calls | `data-service.ts` (uses supabase-js directly); client created in `supabase.ts` | `data-service.ts` L487–L537 |
| Supabase Auth + `admin_users` table | Login and session check decide who can reach the Confirm button | `App.tsx` (`supabase.auth.getSession`), `AdminLogin.tsx` (`signInWithPassword`), `checkIsAdmin` in `data-service.ts` | `App.tsx` L76–L87; `data-service.ts` L708–L729 |
| Browser `localStorage` (fallback store) | Used whenever Supabase is not configured or a call fails | `data-service.ts` (`getLocal`/`setLocal`) | `data-service.ts` L525–L537 |

No notification service or other external API is used in this scenario (searched `src/` for mail/HTTP clients; the only email use is `mailto:` links).

---

## A7. AS-IS structural diagram

```
+--------------------------- Application code (browser) ----------------------------+
|                                                                                   |
|  [Admin reservations UI]  (component)                                             |
|  role: shows Confirm on pending rows                                              |
|          | onUpdateStatus(id, 'confirmed')                                        |
|          v                                                                        |
|  [App state handler]  (module App.tsx)                                            |
|  role: forwards command, updates in-memory list                                   |
|          | updateReservationStatus(id, status)                                    |
|          v                                                                        |
|  [Data service]  (module data-service.ts)                                         |
|  role: executes state change, persists it                                         |
|          | .update({ status })                          | getLocal / setLocal     |
|          v                                              v                         |
|  [Supabase client]  (lib/supabase.ts)                                             |
|                                                                                   |
+-----------------------------------------------------------------------------------+
        | update reservations.status                     | (fallback write)
        v                                                v
 [Supabase Postgres: reservations]  (database)   [Browser localStorage]  (storage)
```

In parallel, the admin gate: `[App state handler] --checkIsAdmin(userId)--> [Data service] --select admin_users--> [Supabase Postgres]`.

---

## A8. Question for the next C03 step

| Item | Content |
|---|---|
| Question | Where should the no-overlap rule live so it holds for creation and confirmation, given that it is currently checked only in the customer's browser? |
| Evidence | `getAvailableTimeSlots` (browser) is the only overlap check (`data-service.ts` L678–L683); `createReservation` inserts without re-checking (L539–L598); `updateReservationStatus` writes `status` unconditionally (L519–L537); the schema has no overlap constraint |
| Why it matters | The project's Risk pressure is double-booking. Two customers can load the same free slot and both book it, and an admin can then confirm both |

---

## Notes to verify at runtime (not yet confirmed)

- Whether the Supabase `update` from a non-admin session returns an error or silently matches zero rows under the current RLS policy. If it silently matches zero rows, the handler in `App.tsx` would still show the reservation as confirmed. This has not been run.
- With Supabase not configured, `checkIsAdmin` returns `true` (`data-service.ts` L728) and the login accepts any password of six or more characters (`AdminLogin.tsx` L46–L51).