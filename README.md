Room Booking Reservation System
Team
Member 1 (GitHub: @S-anthosh)
Member 2 (GitHub: @Shrivethan)
Member 3 (GitHub: @username)
Repository
https://https://github.com/S-anthosh/Reservation_Booking_System

CP1 walking skeleton
This is the one end-to-end path that must be fully runnable after C03 / before C04:

POST /reservations → validate request (room_id, user_id, start_time, end_time) → check room availability (no overlapping CONFIRMED reservation) → persist reservation to database (state = DRAFT) → return reservation ID to the caller → automated check confirms the reservation exists in the database

This path is not implemented yet — only the C01 persistence spike (save + reload a Reservation) has been executed so far. Validation, the availability check, and the API endpoint itself will be built in later cycles.
