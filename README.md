# Room Booking Reservation System

A reservation system for booking rooms and dining tables, built as a team engineering project for the SWI course. Its central design goal is to **make double-booking of a critical room or table impossible**.

## Team

| Member | GitHub |
|--------|--------|
| Member 1 | [@S-anthosh](https://github.com/S-anthosh) |
| Member 2 | [@Shrivethan](https://github.com/Shrivethan) |
| Member 3 | [@arunAK096](https://github.com/arunAK096)  |

- **Repository:** [https://github.com/S-anthosh/Reservation_Booking_System](https://github.com/S-anthosh/Reservation_Booking_System)
- **Commit Reference:** `07f3cbf154879f5e514147719495aeb43bf83cbc`

---

## Project Frame

- **Reserved resource:** Rooms & Dining Tables
- **Users:** People who need to reserve a room or table for a specific time window
- **Future pressure (Risk):** Two users with different (or identical) names reserving the same critical room or table for overlapping times. Every design and architectural decision is checked against this risk.
- **Stack:**
  - **Frontend / Client Application:** React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Motion
  - **Backend & Database Integrations:** Supabase (PostgreSQL with RLS & double-booking prevention trigger) & Offline LocalStorage Fallback
  - **Course Backend Spike:** Python, SQLAlchemy, SQLite, Pytest

---

## Core Behavior & Business Invariants

| Operation | Description |
|-----------|-------------|
| **Create Reservation** | Validates `room_id` / `table_id`, `party_size` (max 5 seats), `start_time`, `end_time`; automatically accepts and confirms the reservation (`status: CONFIRMED`) without manual admin intervention if room space is available. |
| **Check Availability** | Reports whether a dining room has an overlapping active reservation (`CONFIRMED`) in a given 90-minute time window. |
| **Confirm Reservation** | Immediate auto-confirmation upon booking. Moves reservations directly to `CONFIRMED` after verifying no overlapping booking exists for the dining room. |
| **Cancel Reservation** | Moves a reservation to `CANCELLED`, immediately freeing the dining room for other bookings. |

### Invariants:
1. **Double-Booking Prevention:** A reservation's time window must have `start_time < end_time`. Two reservations overlap when:
   $$\text{start}_A < \text{end}_B \quad\text{and}\quad \text{end}_A > \text{start}_B$$
   If two people with different names attempt to book the same dining room at overlapping times, the system rejects the booking with:  
   `"Double-booking is not possible: This dining room is already booked for this date and time."`
2. **Instant Auto-Acceptance:** Reservations are automatically approved and confirmed upon booking when space is available within the room's 5-seat capacity limit, removing admin delays.
3. **90-Minute Non-Overlapping Seating Times:** Seating times are staggered in 90-minute intervals per dining room (e.g. Room 01: 17:00–18:30, 18:30–20:00, 20:00–21:30; Room 02: 17:15–18:45, etc.), mathematically guaranteeing that reservations for the same room cannot overlap.
4. **Dining Limit:** Maximum of **5 guests** per reservation and room capacity is strictly capped at 5 seats. If a time slot reaches capacity, it is marked as `"Limit Exceeded"`.

---

## CP1 Walking Skeleton

The end-to-end path that is fully runnable:

```
POST /reservations
  → validate request (room_id / table_id, party_size <= 5, start_time, end_time)
  → check room availability (no overlapping active reservation: start_a < end_b && end_a > start_b)
  → check slot capacity (total concurrent reservations for this date/time < 5)
  → persist reservation to database (state = DRAFT / pending)
  → return reservation ID & confirmation to the caller
  → automated check confirms the reservation exists in the database
```

---

## Project Status

| Cycle | Deliverable | Status |
|---|---|---|
| **C01** | Repository setup, Project Frame, and persistence spike using SQLAlchemy + SQLite | **Done** |
| **C02** | Behaviour specification, reservation workflow, double-booking prevention requirements, and maximum 5-guest rule | **Done** |
| **C03** | CP1 walking skeleton, request validation, availability checking, reservation API, database persistence, and automated verification | **Done** |
| **C05** | Detailed Design, responsibilities, ownership, interfaces and contracts, UML diagrams, reservation-confirmation algorithm, DD-derived tests, and implementation verification | **Done** |


---

## How to Run This Project

### 1. Prerequisites
- **Node.js** (v18 or higher, recommended v20+)
- **npm** (v9 or higher)
- *(Optional for Python tests)*: **Python 3.10+**

---

### 2. Running the Interactive Web Application (Vite + React)

Clone the repository and install dependencies:

```bash
# Clone the repository
git clone https://github.com/S-anthosh/Reservation_Booking_System.git
cd Reservation_Booking_System

# Install packages
npm install --legacy-peer-deps
```

Start the development server:

```bash
npm run dev
```

Open your browser at:
👉 **`http://localhost:3000`**

#### Key Features in the Web App:
- **Public Booking Flow:** Interactive 4-step reservation wizard (Party size 1-5, Evening & Seating time selection, Guest details, Calendar download).
- **Double-Booking Prevention:** Real-time table conflict validation with instant slot re-checking and user guidance.
- **Admin Management Portal:** Access via the navigation bar (`http://localhost:3000` &rarr; click **"Staff Login"**):
  - Click **"Instant Preview Mode (Bypass Supabase Login)"** for instant access without setting up cloud accounts.
  - Or connect your own Supabase project using `.env` (see `.env.example`).
  - Manage real-time reservations, floor plan tables, menu items, business hours, blocked holiday dates, and restaurant settings.

---

### 3. Optional: Running Python Spike & Unit Tests

If running the Python persistence spike and test suite:

```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# macOS / Linux:
source .venv/bin/activate

# Install requirements (if requirements.txt is present)
pip install -r requirements.txt

# Run automated tests
pytest
```

---

## Repository Structure

```
.
├── src/
│   ├── components/
│   │   ├── admin/           # Admin portal (Reservations, Tables, Menu, Hours, Settings, Login)
│   │   └── public/          # Public guest interface (Hero, Menu, ReservationSection, Story)
│   ├── lib/
│   │   ├── data-service.ts  # Reservation business logic, double-booking validation, capacity checks
│   │   └── supabase.ts      # Supabase client & environment configuration
│   ├── types/
│   │   └── database.ts      # TypeScript interfaces for reservations, tables, settings, slots
│   ├── App.tsx              # Main application root
│   └── main.tsx             # Entry point
├── supabase-schema.sql      # PostgreSQL schema with double-booking prevention trigger & RLS
├── .env.example             # Example environment variables (no secrets)
├── package.json             # NPM package dependencies and scripts
└── README.md                # Project documentation
```

---

## Contributing

- Work on a branch and open a pull request; another team member reviews before merge.
- Do not commit secrets or `.env` files. Commit a `.env.example` instead.
