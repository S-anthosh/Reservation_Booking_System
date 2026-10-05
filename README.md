# Room Booking Reservation System

A reservation system for booking rooms, built as a team engineering project for the SWI course. Its central design goal is to **make double-booking of a critical room impossible**.

## Team

| Member | GitHub |
|--------|--------|
| Member 1 | [@S-anthosh](https://github.com/S-anthosh) |
| Member 2 | [@Shrivethan](https://github.com/Shrivethan) |
| Member 3 | [@arunAK096](https://github.com/arunAK096)  |

Repository: https://github.com/S-anthosh/Reservation_Booking_System

## Project Frame

- **Reserved resource:** rooms
- **Users:** people who need to reserve a room for a time window
- **Future pressure (Risk):** two users reserving the same critical room for overlapping times. Every design decision is checked against this risk.
- **Stack:** Python, SQLAlchemy, SQLite

## Core Behavior

| Operation | Description |
|-----------|-------------|
| Create Reservation | Validate `room_id`, `user_id`, `start_time`, `end_time`; persist a new reservation in state `DRAFT` |
| Check Availability | Report whether a room has an overlapping `CONFIRMED` reservation in a given time window |
| Confirm Reservation | Move a `DRAFT` reservation to `CONFIRMED`, re-checking availability at that moment |
| Cancel Reservation | Move a reservation to `CANCELLED`, freeing the room |

A reservation's time window must have `start_time < end_time`. Two reservations overlap when `start_a < end_b` and `end_a > start_b`; only `CONFIRMED` reservations block a room.

## CP1 Walking Skeleton

The one end-to-end path that must be fully runnable after C03 and before C04:

```
POST /reservations
  → validate request (room_id, user_id, start_time, end_time)
  → check room availability (no overlapping CONFIRMED reservation)
  → persist reservation to database (state = DRAFT)
  → return reservation ID to the caller
  → automated check confirms the reservation exists in the database
```

## Status

| Cycle | Deliverable | Status |
|-------|-------------|--------|
| C01 | Repo structure, Project Frame, future pressure, persistence spike (save + reload a `Reservation` with SQLAlchemy + SQLite) | Done |
| C02 | Behavior spec for the four core operations, running app matching the spec, approval-workflow change (Baseline v0.1 → v0.2) | In progress |
| C03 | CP1 walking skeleton (validation, availability check, `POST /reservations`, automated DB check) | Not started |

## Getting Started

<!-- TODO: fill in once the code is on the main branch. Keep it copy-paste runnable. -->

```bash
git clone https://github.com/S-anthosh/Reservation_Booking_System.git
cd Reservation_Booking_System

python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt  # TODO: add requirements.txt

# TODO: command to run the app
# TODO: command to run the tests (e.g. pytest)
```

## Repository Structure

<!-- TODO: replace with the real layout once it exists -->

```
.
├── src/        # application code
├── tests/      # automated tests
├── docs/       # project frame, behavior spec, evidence, baselines
└── README.md
```

## Contributing

- Work on a branch and open a pull request; another team member reviews before merge.
- Do not commit secrets or `.env` files. Commit a `.env.example` instead.
