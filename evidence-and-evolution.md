# Evidence and Evolution

> Items marked **TODO** need facts only the team knows (hashes, dates, observations). Do not leave them in the submitted version, and do not fill them with anything that was not actually run.

## C01 Engineering Spike

**Question / unknown:** Can a team member reliably set up the project (Node/Vite client and the Python SQLAlchemy + SQLite persistence spike) from a clean clone using only the README instructions?

**What we did:** TODO: who committed the initial setup (`package.json`, `requirements.txt`, SQLAlchemy + SQLite spike, `.env.example`) and who performed the clean checkout (README lists three members: @S-anthosh, @Shrivethan, @arunAK096).

**Observed result:** TODO: what actually broke on the clean checkout. Known from our own setup: `npm install` needs `--legacy-peer-deps`; Vite 8 and Vitest 5 need Node 22 (Node 20.15 gives engine warnings); PowerShell blocks `npm` scripts until the execution policy is relaxed; test script was missing from `package.json`.

**Decision / what changes because of the result:** TODO: confirm with team. Proposed: document Node 22 LTS in the README prerequisites, add the `"test": "vitest run"` script, and note the PowerShell policy fix for Windows users.

---

## C02 Minimum Behavior & Change Evidence

**Accepted baseline:** Specification Baseline v0.2 (see `intent-and-change.md`): minimum behavior v0.1 plus the v0.2 Administrator Approval Workflow for restricted dining rooms. TODO: name of the team review in which it was accepted.

**Core operations demonstrated**

| Operation | Where it is implemented / how it is triggered |
|---|---|
| OP-01 Create Reservation | `createReservation` in `src/lib/data-service.ts`, called from the booking wizard `ReservationSection.tsx` |
| OP-02 Check Availability | `getAvailableTimeSlots` in `src/lib/data-service.ts` (slots shown or disabled in the wizard) |
| OP-03 Confirm Reservation | Standard rooms: status set to `confirmed` on creation (auto-accept); admin confirm in `ReservationsView.tsx` |
| OP-04 Cancel Reservation | `updateReservationStatus(id, 'cancelled')` from the admin dashboard |
| OP-05 Approve / Reject | **Proposed in v0.2, not implemented in the running app** (TODO: confirm; if it is implemented, add the file/line) |

**Verification examples actually executed:** TODO: fill from your own C02 run. For each row write what you did (UI click path or test name) and the observed result. Do not write PASS without running it.

| Example (from baseline) | How executed | Observed |
|---|---|---|
| Valid slot, 4 guests → reservation created | TODO | TODO |
| 6 guests rejected | TODO | TODO |
| Overlapping slot is UNAVAILABLE / disabled | TODO | TODO |
| Overlap on submit → "Double-booking is not possible…" | TODO | TODO |
| Cancel before start → CANCELLED; after start → rejected | TODO | TODO |

**Mismatch found and resolved:** TODO. Candidates already visible in the repo documents: (1) the C03 note says overlap is checked only in the browser (`getAvailableTimeSlots`), while the AS-IS table says `createReservation` also re-checks and the schema has a trigger; the two statements disagree and must be reconciled by reading the code. (2) README says the first state is DRAFT/pending in the walking skeleton but later says reservations are auto-confirmed.

**Change impact summary:** Introducing approval for restricted rooms affects OP-03 (confirm routes to `PENDING_APPROVAL` for restricted rooms), OP-04 (cancel also allowed from `PENDING_APPROVAL`), adds the `PENDING_APPROVAL` state and OP-05 for the administrator. OP-01, OP-02, BR-01, BR-02, BR-04 and BR-05 are unaffected because only CONFIRMED reservations block a room.

**Remaining assumption / unknown**
- Assumption: Supabase answers fast enough for synchronous check-then-insert; the `localStorage` fallback is acceptable for demo use.
- Unknown: how to clean up abandoned DRAFT / `PENDING_APPROVAL` reservations; expiry would only be evaluated when an approval is attempted.

**Architecture driver(s) carried into C03**
- Separation of domain rules from storage and UI: booking rules, status transitions and Supabase / `localStorage` calls are mixed in `data-service.ts`.
- Concurrency: two guests can load the same free slot; the check-then-insert gap needs an atomic guard (Postgres trigger today).

**Application commit/tag:** TODO

---

## C04 Quality & Measurement

**1. Quality concern and evaluable criterion (Q1)**
- Quality concern: correctness of the no-overlap invariant (BR-02) under concurrent booking attempts for the same room and time.
- Criterion: when N parallel requests try to book the same room slot, exactly one succeeds, the other N-1 are rejected with the double-booking error, and the store contains no two overlapping CONFIRMED reservations for that room.

**2. Measurement and evidence (Q2)**
- Setup run so far: component test `concurrent_create_only_one_wins` (N = 2) against the in-memory repository whose `insertIfFree` is atomic. Result: exactly one succeeded, the other returned `DOUBLE_BOOKING` (see C05 below).
- **Not yet measured:** N = 50 and the real Supabase trigger. TODO: either run a script with 50 parallel inserts against a test Supabase project and record the winner count, or state clearly that only N = 2 against the in-memory repository was measured.

**3. Engineering decision (Q3)**
- Decision: the check and insert must be one atomic repository operation (`insertIfFree`); in production the Postgres trigger `prevent_table_double_booking` is the authority, and the browser-side slot check is only an advisory filter.
- Known limitation: the `localStorage` fallback cannot give cross-browser atomicity; it is documented as demo-only.

---

## C05 DD Verification Evidence

### Tests derived from DD

File: `src/lib/__tests__/reservationPolicy.test.ts` (8 tests). They use pure functions and an in-memory repository (`inMemoryRepo.ts`); nothing touches Supabase or `localStorage`.

| DD element / decision | What must hold? | Test level | Test case |
|---|---|---|---|
| Algorithm boundary (BR-01) | Adjacent slots (end 18:30 / start 18:30) do not overlap | unit | `overlaps_false_for_adjacent_slots` |
| Interface contract `decide` | Valid request, no active bookings → confirmed | unit | `decide_confirms_when_room_free` |
| Algorithm branch (overlap) | Window overlapping an active booking → `OVERLAP` | unit | `decide_rejects_overlapping_window` |
| State transition | `cancelled → confirmed` not allowed; `confirmed → cancelled` allowed | unit | `cannot_reconfirm_cancelled` |
| Failure behavior (BR-04) | 6 guests → `PARTY_TOO_LARGE`, repository never called | unit | `create_rejects_party_of_6_without_touching_repo` |
| Slot rule (BR-05) | Off-grid window → `INVALID_SLOT` | unit | `create_rejects_off_grid_slot` |
| State transition + collaboration | After cancel, the same slot can be booked again | component | `cancel_then_rebook_same_slot_succeeds` |
| Collaboration (race) | Two concurrent creates for the same window → exactly one wins, the other `DOUBLE_BOOKING` | component | `concurrent_create_only_one_wins` |

**Two tests explained**

1. `overlaps_false_for_adjacent_slots`
   - Selected level: unit.
   - Why this level: one pure function, two inputs, no storage; fast and a failure points at the exact comparison.
   - Design decision verified: overlap uses half-open intervals `[start, end)`, which is what makes back-to-back 90-minute seatings legal (BR-01).
2. `concurrent_create_only_one_wins`
   - Selected level: component (`ReservationService` + in-memory repository).
   - Why this level: the race exists only in the collaboration between service and repository; neither alone can show it.
   - Design decision verified: check-and-insert is one atomic repository operation (`insertIfFree`); in production the Postgres trigger plays that role.

### Unit/component tests executed

Command: `npm test` (Vitest 5.1.0, Node 22), run on 2026-11-08 in the working copy.

```
 ✓ src/lib/__tests__/reservationPolicy.test.ts (8 tests)
 Test Files  1 passed (1)
      Tests  8 passed (8)
```

### Design ↔ implementation mismatch

| DD decision | Implemented? | Evidence | Action |
|---|---|---|---|
| `decide` is pure, no I/O | YES | `src/lib/reservationPolicy.ts`; 4 policy tests | keep |
| Overlap defined once in `ReservationPolicy.overlaps` | PARTLY | New module tested; `data-service.ts` still contains its own overlap comparisons | update code (call the policy from `data-service.ts`) |
| `ReservationRepository` interface with Supabase and localStorage adapters | PARTLY | Interface and in-memory adapter exist (`reservationService.ts`, `__tests__/inMemoryRepo.ts`); no Supabase / localStorage adapter yet | update code |
| `insertIfFree` atomic | PARTLY | In-memory: `concurrent_create_only_one_wins` passes; Supabase: trigger in `supabase-schema.sql` (not exercised by a test) | keep for Supabase; document localStorage limitation |
| Status machine rejects illegal transitions | PARTLY | `canTransition` and `cancel` tested; `updateReservationStatus` in `data-service.ts` still writes status unconditionally | update code |
| Direct creation as `confirmed` for standard rooms | YES | README invariant 2; C03 A2 | keep |
| Approval branch (`PENDING_APPROVAL`) | NO | Part of v0.2 only; not in `ReservationPolicy` or the app | update DD and code, or mark out of scope for this unit |

### Resolution

Where code and design disagreed we kept the design decisions and chose to change the code: policy and service were extracted as a pure, tested layer first. Wiring `data-service.ts` to `ReservationService` through Supabase and localStorage repository adapters is the next step. TODO: update this section once that is done, and re-run `npm test`.

### Remaining design risk

- **R-1** `localStorage` fallback is not atomic across browsers (demo only).
- **R-2** With Supabase unconfigured, `checkIsAdmin` returns true and the staff login accepts any password of six or more characters (C03 notes). Out of this unit's scope but a real security risk.
- **R-3** Whether the RLS policy makes a non-admin status update fail or silently match zero rows is not yet verified.
- **R-4** The Postgres trigger is not covered by an automated test.
- **R-5** Ambiguity in the README: "5 seats per room" versus "max 5 reservations per slot". We follow "party size ≤ 5" with exclusive room-per-slot booking; TODO: confirm with the team and record it.
- **R-6** Abandoned DRAFT / `PENDING_APPROVAL` reservations are not cleaned up.

### Commit/tag

Tag `c05-dd-v1` on branch `c05-detailed-design`. TODO: add the commit hash (`git rev-parse --short HEAD`).
