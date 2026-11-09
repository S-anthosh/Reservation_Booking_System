export type Status = 'confirmed' | 'cancelled' | 'completed';
export interface Interval { start: Date; end: Date }
export interface NewReservation extends Interval {
  roomId: string; partySize: number; guest: { name: string; email: string };
}
export interface Reservation extends NewReservation { id: string; status: Status }

export const MAX_PARTY = 5;

export function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && a.end > b.start; // half-open
}

export function validate(req: NewReservation): 'INVALID_INPUT' | 'PARTY_TOO_LARGE' | null {
  if (req.start >= req.end || req.partySize < 1) return 'INVALID_INPUT';
  if (req.partySize > MAX_PARTY) return 'PARTY_TOO_LARGE';
  return null;
}

export type Decision =
  | { ok: true; status: 'confirmed' }
  | { ok: false; reason: 'INVALID_INPUT' | 'PARTY_TOO_LARGE' | 'OVERLAP' };

export function decide(req: NewReservation, active: Reservation[]): Decision {
  const invalid = validate(req);
  if (invalid) return { ok: false, reason: invalid };
  if (active.some(r => overlaps(req, r))) return { ok: false, reason: 'OVERLAP' };
  return { ok: true, status: 'confirmed' };
}

const allowed: Record<Status, Status[]> = {
  confirmed: ['cancelled', 'completed'],
  cancelled: [],
  completed: [],
};
export function canTransition(from: Status, to: Status): boolean {
  return allowed[from].includes(to);
}