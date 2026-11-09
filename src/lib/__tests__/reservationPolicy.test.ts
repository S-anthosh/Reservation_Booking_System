// src/lib/__tests__/reservationPolicy.test.ts
// Tests derived from C05 Detailed Design. Adjust import paths to your refactor.
import { describe, it, expect } from 'vitest';
import { overlaps, decide, canTransition } from '../reservationPolicy';
import { ReservationService } from '../reservationService';
import { InMemoryReservationRepository } from './inMemoryRepo';

const t = (hhmm: string) => new Date(`2026-12-01T${hhmm}:00`);
const req = (start: string, end: string, partySize = 2, roomId = 'room-1') =>
  ({ roomId, partySize, start: t(start), end: t(end), guest: { name: 'A', email: 'a@x.cz' } });

describe('ReservationPolicy', () => {
  it('overlaps_false_for_adjacent_slots', () => {
    expect(overlaps({ start: t('17:00'), end: t('18:30') }, { start: t('18:30'), end: t('20:00') })).toBe(false);
  });

  it('decide_confirms_when_room_free', () => {
    expect(decide(req('17:00', '18:30'), [])).toEqual({ ok: true, status: 'confirmed' });
  });

  it('decide_rejects_overlapping_window', () => {
    const active = [{ id: '1', ...req('17:00', '18:30'), status: 'confirmed' as const }];
    expect(decide(req('18:00', '19:30'), active)).toEqual({ ok: false, reason: 'OVERLAP' });
  });

  it('cannot_reconfirm_cancelled', () => {
    expect(canTransition('cancelled', 'confirmed')).toBe(false);
    expect(canTransition('confirmed', 'cancelled')).toBe(true);
  });
});

describe('ReservationService', () => {
  it('create_rejects_party_of_6_without_touching_repo', async () => {
    const repo = new InMemoryReservationRepository();
    const res = await new ReservationService(repo).createReservation(req('17:00', '18:30', 6));
    expect(res).toMatchObject({ ok: false, error: 'PARTY_TOO_LARGE' });
    expect(repo.insertCalls).toBe(0);
  });

  it('create_rejects_off_grid_slot', async () => {
    const res = await new ReservationService(new InMemoryReservationRepository())
      .createReservation(req('17:10', '18:40'));
    expect(res).toMatchObject({ ok: false, error: 'INVALID_SLOT' });
  });

  it('cancel_then_rebook_same_slot_succeeds', async () => {
    const svc = new ReservationService(new InMemoryReservationRepository());
    const first = await svc.createReservation(req('17:00', '18:30'));
    if (!first.ok) throw new Error('setup failed');
    await svc.cancel(first.value.id);
    expect((await svc.createReservation(req('17:00', '18:30'))).ok).toBe(true);
  });

  it('concurrent_create_only_one_wins', async () => {
    const svc = new ReservationService(new InMemoryReservationRepository());
    const [a, b] = await Promise.all([
      svc.createReservation(req('17:00', '18:30')),
      svc.createReservation(req('17:00', '18:30')),
    ]);
    expect([a.ok, b.ok].filter(Boolean)).toHaveLength(1);
    const failed = a.ok ? b : a;
    expect(failed).toMatchObject({ ok: false, error: 'DOUBLE_BOOKING' });
  });
});