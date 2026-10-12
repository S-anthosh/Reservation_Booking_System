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

## A2. Main scenario path → code

| C02 scenario step | Implementation location | Evidence |
|---|---|---|
| Accept confirmation request | Admin clicks **Confirm** on a pending row; calls `onUpdateStatus(res.id, 'confirmed')` | `src/components/admin/ReservationsView.tsx` L275–L281 |
| Forward the command | `handleUpdateReservationStatus(id, status)` | `src/App.tsx` L233–L238 |
| Load Reservation | Not done at confirm time. All reservations are loaded into React state on startup by `getReservations()`, and the row the admin clicks is that in-memory copy | `src/App.tsx` L128; `src/lib/data-service.ts` L487–L517 |
| Check that the transition is allowed | UI only: the row's Confirm button renders only when `res.status === 'pending'`. No check in the handler or data layer. The detail panel offers all four statuses for any reservation | `ReservationsView.tsx` L275; L378–L383 |
| Evaluate conflict | **Not performed at confirm.** Overlap is evaluated only when customers pick a slot (`getAvailableTimeSlots`) | `data-service.ts` L600–L705 (see A5) |
| Change state | `updateReservationStatus(id, status)` sets the new status directly; there is no domain object or state machine | `data-service.ts` L519–L537 |
| Persist result | Supabase `.from('reservations').update({ status }).eq('id', id)`; otherwise falls back to `localStorage` | `data-service.ts` L525–L534 |
| Update the UI | On `true`, React state is updated with the new status | `App.tsx` L234–L237 |

## A3. Alternative / failure path: conflict exists → confirmation is rejected

| v0.2 behaviour | Where condition is detected | Where outcome is decided | What caller receives |
|---|---|---|---|
| TODO: copy the v0.2 wording (expected: conflict → reject) | Nowhere at confirm time | Nowhere; the status update is unconditional | `true` (the row shows *confirmed*) |

**Mismatches**

| Specification | Implementation | Evidence |
|---|---|---|
| Confirm re-checks for conflicts and rejects (TODO: verify wording in v0.2) | No conflict check on confirm; `updateReservationStatus` only writes `status` | `data-service.ts` L519–L537 |
| Only valid transitions are allowed (TODO: verify in v0.2) | Detail panel lets an admin set any status from any status, including `cancelled → confirmed` | `ReservationsView.tsx` L378–L383 |
| A failed confirm is reported | If the Supabase update throws, the error is only logged, the change is written to `localStorage` instead, and `true` is returned. The handler has no error branch | `data-service.ts` L528–L536; `App.tsx` L233–L238 |

---

## A4. Main implementation elements

| Implementation element | Type / contents | Role in this scenario | Evidence |
|---|---|---|---|
| Admin reservations UI | Component `ReservationsView` | Shows the Confirm button, emits the confirm command | `ReservationsView.tsx` L275–L281 |
| App state handler | `App.tsx`: `handleUpdateReservationStatus`, `checkIsAdmin` gate | Forwards the command, updates the in-memory list, gates the dashboard to admin users | `App.tsx` L80–L87, L233–L238 |
| Data service | Module `data-service.ts`: `updateReservationStatus`, `getReservations`, `getAvailableTimeSlots`, `createReservation`, `checkIsAdmin` | Executes the state change, persists it, and holds the overlap logic used at booking time | `data-service.ts` L487–L729 |
| Supabase client | `src/lib/supabase.ts` | Creates the client from env or `localStorage` credentials | `supabase.ts` |

Contained elements:

- **Data service:** `updateReservationStatus`, `getReservations`, `createReservation`, `getAvailableTimeSlots`, `checkIsAdmin`, and `getLocal`/`setLocal` helpers for the fallback.

## A5. State, state change, and one rule

### State

| Question | Answer | Evidence |
|---|---|---|
| Where is Reservation state persisted? | Postgres table `reservations`, column `status` (`pending`, `confirmed`, `cancelled`, `completed`). If Supabase is unavailable, a copy in browser `localStorage` under `STORAGE_KEYS.RESERVATIONS`. A third copy lives in React state in `App.tsx` | `supabase-schema.sql` (`reservations` table); `data-service.ts` L525–L534; `App.tsx` L234–L237 |
| Which code decides/executes the transition used in the scenario? | The **admin's click** decides (there is no domain rule). `updateReservationStatus` executes it as an unconditional write | `ReservationsView.tsx` L276; `data-service.ts` L519–L537 |

### Business rule: a table must not be booked for overlapping times

| Question | Answer | Evidence |
|---|---|---|
| Where is the rule condition detected? | In the browser, in `getAvailableTimeSlots`: the `hasOverlap` check compares the candidate slot with every non-cancelled reservation on that table and date | `data-service.ts` L651, L678–L683 |
| Where is the outcome decided? | Same function: a slot with an overlap is simply not added to `availableSlots`, so the customer never sees it | `data-service.ts` L686–L699 |
| Where is the resulting state change performed? | None. There is no rejection. A booking is inserted as `pending` by `createReservation` without re-checking, and confirmation does not re-check either | `data-service.ts` L539–L598, L519–L537 |

The rule is enforced in one place only, and only for the customer booking screen. The database schema has no overlap or exclusion constraint (only `CHECK`s on `party_size` and `status`).

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