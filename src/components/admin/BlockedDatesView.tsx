import React, { useState } from 'react';
import { CalendarX, Plus, Trash2, Calendar, AlertCircle, X, ShieldAlert } from 'lucide-react';
import { BlockedDate } from '../../types/database';

interface BlockedDatesViewProps {
  blockedDates: BlockedDate[];
  onAddBlockedDate: (date: string, reason: string) => Promise<boolean>;
  onDeleteBlockedDate: (id: string) => Promise<boolean>;
}

export const BlockedDatesView: React.FC<BlockedDatesViewProps> = ({
  blockedDates,
  onAddBlockedDate,
  onDeleteBlockedDate,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
    setReason('Private Dining Buyout');
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      setErrorMsg('Please select a date to block.');
      return;
    }
    if (!reason.trim()) {
      setErrorMsg('Please specify a reason.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    try {
      const ok = await onAddBlockedDate(selectedDate, reason.trim());
      if (ok) {
        setIsModalOpen(false);
        setSelectedDate('');
        setReason('');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to block date.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f2230]">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase text-[#d4a754] block mb-1">
            Service Blackouts
          </span>
          <h1 className="font-serif text-3xl font-light text-[#fbf9f5]">
            Blocked Dates Manager
          </h1>
          <p className="text-xs text-[#9ca3af] mt-1">
            Block specific evenings for full restaurant buyouts, seasonal holidays, or private
            events. Blocked dates immediately stop all public online reservations.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#c59b43] text-black hover:bg-[#d4a754] transition-colors cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Block a Date</span>
        </button>
      </div>

      <div className="bg-[#12141c] border border-[#232736] rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#1f2230] flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider">
            <CalendarX className="w-4 h-4 text-[#ef4444]" />
            <span>Blackout Schedule ({blockedDates.length})</span>
          </div>
        </div>

        {blockedDates.length === 0 ? (
          <div className="py-16 text-center text-[#9ca3af]">
            <Calendar className="w-8 h-8 text-[#4b5563] mx-auto mb-2" />
            <p className="text-sm text-white">No blocked dates scheduled</p>
            <p className="text-xs text-[#6b7280] mt-1">
              All normal business hours are currently available for table bookings.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#1e2230]">
            {blockedDates
              .sort((a, b) => a.blocked_date.localeCompare(b.blocked_date))
              .map((b) => (
                <div
                  key={b.id}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#161824] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[#20181a] border border-[#482025] flex flex-col items-center justify-center text-center shrink-0">
                      <span className="text-[10px] text-[#ef5350] font-semibold uppercase">
                        {new Date(b.blocked_date + 'T00:00:00').toLocaleDateString('en-US', {
                          month: 'short',
                        })}
                      </span>
                      <span className="font-serif text-lg font-bold text-white leading-none">
                        {new Date(b.blocked_date + 'T00:00:00').getDate()}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-white block">
                        {new Date(b.blocked_date + 'T00:00:00').toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="text-xs text-[#d4a754] font-medium mt-0.5 block">
                        Reason: {b.reason}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Unblock date ${b.blocked_date}?`)) {
                        onDeleteBlockedDate(b.id);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 bg-[#221619] hover:bg-[#341b20] border border-[#52252a] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Unblock Date</span>
                  </button>
                </div>
              ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-[#2c3245] rounded-xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#212534]">
              <div>
                <span className="text-[10px] text-[#ef5350] uppercase tracking-wider block">
                  Service Blackout
                </span>
                <h3 className="font-serif text-xl text-white font-medium">
                  Block Reservation Date
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#9ca3af] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded bg-[#201819] border border-[#5c2729] text-xs text-[#e57373] flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#9ca3af] uppercase text-[10px] font-semibold mb-1">
                  Target Date to Blackout *
                </label>
                <input
                  type="date"
                  required
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-[#161822] border border-[#262a38] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#d4a754] cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-[#9ca3af] uppercase text-[10px] font-semibold mb-1">
                  Reason for Blackout *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Private Buyout Event, Kitchen Renovation, Christmas Day"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-[#161822] border border-[#262a38] rounded-lg p-2.5 text-white focus:outline-none focus:border-[#d4a754]"
                />
              </div>

              <div className="p-3 rounded-lg bg-[#181a24] border border-[#282d3f] text-[11px] text-[#9ca3af] flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-[#ef5350] shrink-0 mt-0.5" />
                <span>
                  Once saved, visitors will not be permitted to book any slots on this date.
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#212534]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded text-xs text-[#9ca3af] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded text-xs font-semibold bg-[#ef4444] text-white hover:bg-[#dc2626] transition-colors cursor-pointer"
                >
                  {submitting ? 'Blocking...' : 'Confirm Blackout Date'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
