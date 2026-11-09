import { Reservation, NewReservation, Status, overlaps } from '../reservationPolicy';
import { ReservationRepository, Result, RepoError } from '../reservationService';

export class InMemoryReservationRepository implements ReservationRepository {
  private rows: Reservation[] = [];
  private seq = 0;
  insertCalls = 0;

  async findActiveByRoom(roomId: string, from: Date, to: Date) {
    return this.rows.filter(r => r.roomId === roomId && r.status === 'confirmed'
      && overlaps(r, { start: from, end: to }));
  }
  async findById(id: string) { return this.rows.find(r => r.id === id) ?? null; }

  // No await between check and push => atomic
  async insertIfFree(draft: NewReservation): Promise<Result<Reservation, RepoError>> {
    this.insertCalls++;
    const clash = this.rows.some(r => r.roomId === draft.roomId
      && r.status === 'confirmed' && overlaps(r, draft));
    if (clash) return { ok: false, error: 'DOUBLE_BOOKING' };
    const row: Reservation = { ...draft, id: String(++this.seq), status: 'confirmed' };
    this.rows.push(row);
    return { ok: true, value: row };
  }

  async updateStatus(id: string, status: Status) {
    const r = this.rows.find(x => x.id === id);
    if (!r) return { ok: false, error: 'NOT_FOUND' } as const;
    r.status = status;
    return { ok: true, value: r } as const;
  }
}