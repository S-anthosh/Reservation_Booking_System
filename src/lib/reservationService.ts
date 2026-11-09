import {
  NewReservation, Reservation, Status, Interval,
  decide, validate, canTransition,
} from './reservationPolicy';

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };
export type RepoError = 'DOUBLE_BOOKING' | 'STORAGE_ERROR';

export interface ReservationRepository {
  findActiveByRoom(roomId: string, from: Date, to: Date): Promise<Reservation[]>;
  findById(id: string): Promise<Reservation | null>;
  insertIfFree(draft: NewReservation): Promise<Result<Reservation, RepoError>>;
  updateStatus(id: string, status: Status): Promise<Result<Reservation, RepoError | 'NOT_FOUND'>>;
}

// Slot grid: each room starts at its own offset, 90-min slots
const SLOT_MINUTES = 90;
const ROOM_START_MIN: Record<string, number> = { 'room-1': 17 * 60, 'room-2': 17 * 60 + 15 };

export function isValidSlot(roomId: string, w: Interval): boolean {
  const base = ROOM_START_MIN[roomId] ?? 17 * 60;
  const startMin = w.start.getHours() * 60 + w.start.getMinutes();
  const lenMin = (w.end.getTime() - w.start.getTime()) / 60000;
  return lenMin === SLOT_MINUTES && startMin >= base && (startMin - base) % SLOT_MINUTES === 0;
}

export type CreateError =
  | 'INVALID_INPUT' | 'PARTY_TOO_LARGE' | 'INVALID_SLOT' | 'OVERLAP' | RepoError;

export class ReservationService {
  constructor(private repo: ReservationRepository) {}

  async createReservation(req: NewReservation): Promise<Result<Reservation, CreateError>> {
    const invalid = validate(req);
    if (invalid) return { ok: false, error: invalid };
    if (!isValidSlot(req.roomId, req)) return { ok: false, error: 'INVALID_SLOT' };

    const active = await this.repo.findActiveByRoom(req.roomId, req.start, req.end);
    const d = decide(req, active);
    if (!d.ok) return { ok: false, error: d.reason };

    return this.repo.insertIfFree(req); // atomic check+insert
  }

  async cancel(id: string) {
    const r = await this.repo.findById(id);
    if (!r) return { ok: false, error: 'NOT_FOUND' } as const;
    if (!canTransition(r.status, 'cancelled')) return { ok: false, error: 'INVALID_TRANSITION' } as const;
    return this.repo.updateStatus(id, 'cancelled');
  }
}