import React, { useState } from 'react';
import {
  CalendarCheck2,
  Search,
  Plus,
  Users,
  X,
} from 'lucide-react';
import { Reservation, RestaurantTable } from '../../types/database';

interface ReservationsViewProps {
  reservations: Reservation[];
  tables: RestaurantTable[];
  onUpdateStatus: (id: string, status: Reservation['status']) => void;
  onCreateReservation: (reservation: any) => Promise<boolean>;
}

export const ReservationsView: React.FC<ReservationsViewProps> = ({
  reservations,
  tables,
  onUpdateStatus,
  onCreateReservation,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'upcoming' | 'past'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPartySize, setNewPartySize] = useState(2);
  const [newTableId, setNewTableId] = useState(tables[0]?.id || '');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStartTime, setNewStartTime] = useState('18:00');
  const [newEndTime, setNewEndTime] = useState('19:30');
  const [newSpecialRequests, setNewSpecialRequests] = useState('');
  const [modalSubmitting, setModalSubmitting] = useState(false);

  const [activeDetail, setActiveDetail] = useState<Reservation | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredReservations = reservations.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (dateFilter === 'today' && r.reservation_date !== todayStr) return false;
    if (dateFilter === 'upcoming' && r.reservation_date < todayStr) return false;
    if (dateFilter === 'past' && r.reservation_date >= todayStr) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = r.full_name?.toLowerCase().includes(q);
      const matchEmail = r.email?.toLowerCase().includes(q);
      const matchPhone = r.phone?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }

    return true;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalSubmitting(true);
    try {
      const ok = await onCreateReservation({
        full_name: newFullName.trim(),
        email: newEmail.trim(),
        phone: newPhone.trim(),
        party_size: Number(newPartySize),
        table_id: newTableId,
        reservation_date: newDate,
        start_time: newStartTime,
        end_time: newEndTime,
        special_requests: newSpecialRequests.trim() || null,
      });
      if (ok) {
        setShowNewModal(false);
        setNewFullName('');
        setNewEmail('');
        setNewPhone('');
        setNewSpecialRequests('');
      }
    } finally {
      setModalSubmitting(false);
    }
  };

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-800">
            Pending
          </span>
        );
      case 'completed':
        return (
          <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-blue-950/80 text-blue-400 border border-blue-800">
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-rose-950/80 text-rose-400 border border-rose-800">
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f2230]">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase text-[#d4a754] block mb-1">
            Table Bookings
          </span>
          <h1 className="font-serif text-3xl font-light text-[#fbf9f5]">
            Guest Reservations Manager
          </h1>
          <p className="text-xs text-[#9ca3af] mt-1">
            Real-time reservation log, approvals, and guest service records.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#c59b43] text-black hover:bg-[#d4a754] transition-colors cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>New Phone / Walk-in Booking</span>
        </button>
      </div>

      <div className="bg-[#12141c] border border-[#232736] rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#6b7280]" />
          <input
            type="text"
            placeholder="Search by guest name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161822] border border-[#262a38] rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-[#525969] focus:outline-none focus:border-[#d4a754]"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-[#6b7280] hidden sm:inline">Status:</span>
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors cursor-pointer ${
                statusFilter === status
                  ? 'bg-[#c59b43] text-black font-semibold shadow'
                  : 'bg-[#181a24] text-[#9ca3af] hover:text-white border border-[#282d3f]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 bg-[#161822] border border-[#262a38] p-1 rounded-lg">
          {(['all', 'today', 'upcoming', 'past'] as const).map((df) => (
            <button
              key={df}
              onClick={() => setDateFilter(df)}
              className={`px-2.5 py-1 rounded text-[11px] font-medium capitalize transition-colors cursor-pointer ${
                dateFilter === df
                  ? 'bg-[#252a3a] text-white shadow-xs'
                  : 'text-[#6b7280] hover:text-[#cbd5e1]'
              }`}
            >
              {df}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#12141c] border border-[#232736] rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151722] border-b border-[#232736] text-[#9ca3af] uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Guest Name &amp; Contact</th>
                <th className="py-3.5 px-4 font-semibold">Party</th>
                <th className="py-3.5 px-4 font-semibold">Allocated Table</th>
                <th className="py-3.5 px-4 font-semibold">Date &amp; Time</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Special Requests</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2230]">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#9ca3af]">
                    <CalendarCheck2 className="w-8 h-8 text-[#4b5563] mx-auto mb-2" />
                    <p className="text-sm text-white">No reservations found</p>
                    <p className="text-xs text-[#6b7280]">
                      Try adjusting your status, date, or search filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredReservations.map((res) => {
                  const table =
                    res.restaurant_tables || tables.find((t) => t.id === res.table_id);
                  return (
                    <tr
                      key={res.id}
                      className="hover:bg-[#161824] transition-colors group cursor-pointer"
                      onClick={() => setActiveDetail(res)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white text-sm">{res.full_name}</div>
                        <div className="text-[11px] text-[#9ca3af] flex items-center gap-2 mt-0.5">
                          <span>{res.phone}</span>
                          <span>·</span>
                          <span className="truncate max-w-[150px]">{res.email}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-white">
                          <Users className="w-3.5 h-3.5 text-[#d4a754]" />
                          <span>{res.party_size}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-white font-medium">
                          {table?.table_name || 'Assigned Table'}
                        </div>
                        <div className="text-[10px] text-[#6b7280]">{table?.area}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-white font-medium">
                          {new Date(res.reservation_date + 'T00:00:00').toLocaleDateString(
                            'en-US',
                            { month: 'short', day: 'numeric', year: 'numeric' }
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-[#d4a754]">
                          {res.start_time} - {res.end_time}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">{getStatusBadge(res.status)}</td>

                      <td className="py-3.5 px-4 max-w-xs">
                        {res.special_requests ? (
                          <span className="text-[11px] text-[#cbd5e1] italic truncate block">
                            "{res.special_requests}"
                          </span>
                        ) : (
                          <span className="text-[11px] text-[#6b7280]">—</span>
                        )}
                      </td>

                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {res.status === 'pending' && (
                            <button
                              onClick={() => onUpdateStatus(res.id, 'confirmed')}
                              title="Confirm Reservation"
                              className="px-2.5 py-1 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 cursor-pointer"
                            >
                              Confirm
                            </button>
                          )}
                          {res.status !== 'completed' && res.status !== 'cancelled' && (
                            <button
                              onClick={() => onUpdateStatus(res.id, 'completed')}
                              title="Mark Seated / Completed"
                              className="px-2 py-1 rounded text-[11px] text-[#cbd5e1] hover:text-white bg-[#1e2230] border border-[#2d3346] cursor-pointer"
                            >
                              Seated
                            </button>
                          )}
                          {res.status !== 'cancelled' && (
                            <button
                              onClick={() => onUpdateStatus(res.id, 'cancelled')}
                              title="Cancel Reservation"
                              className="px-2 py-1 rounded text-[11px] text-rose-400 hover:bg-rose-950/60 cursor-pointer"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {activeDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-[#2c3245] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#212534]">
              <div>
                <span className="text-[10px] text-[#9ca3af] uppercase tracking-wider block">
                  Reservation Details
                </span>
                <h3 className="font-serif text-xl text-white font-medium">
                  {activeDetail.full_name}
                </h3>
              </div>
              <button
                onClick={() => setActiveDetail(null)}
                className="text-[#9ca3af] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#6b7280] block text-[10px] uppercase">Phone</span>
                <a href={`tel:${activeDetail.phone}`} className="text-white hover:text-[#d4a754]">
                  {activeDetail.phone}
                </a>
              </div>
              <div>
                <span className="text-[#6b7280] block text-[10px] uppercase">Email</span>
                <a href={`mailto:${activeDetail.email}`} className="text-white hover:text-[#d4a754] truncate block">
                  {activeDetail.email}
                </a>
              </div>
              <div>
                <span className="text-[#6b7280] block text-[10px] uppercase">Date &amp; Time</span>
                <span className="text-white font-medium">
                  {activeDetail.reservation_date} · {activeDetail.start_time} - {activeDetail.end_time}
                </span>
              </div>
              <div>
                <span className="text-[#6b7280] block text-[10px] uppercase">Party Size</span>
                <span className="text-white font-medium">{activeDetail.party_size} Guests</span>
              </div>
            </div>

            <div className="p-3 rounded bg-[#161822] border border-[#242938] text-xs">
              <span className="text-[#6b7280] block text-[10px] uppercase mb-1">Assigned Table</span>
              <span className="text-[#d4a754] font-medium">
                {activeDetail.restaurant_tables?.table_name ||
                  tables.find((t) => t.id === activeDetail.table_id)?.table_name ||
                  'Assigned Table'}
              </span>
            </div>

            {activeDetail.special_requests && (
              <div className="p-3 rounded bg-[#161822] border border-[#242938] text-xs">
                <span className="text-[#6b7280] block text-[10px] uppercase mb-1">
                  Special Requests &amp; Notes
                </span>
                <p className="text-[#cbd5e1] italic">"{activeDetail.special_requests}"</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-[#212534]">
              <span className="text-xs text-[#9ca3af]">Update Status:</span>
              <div className="flex items-center gap-2">
                {(['pending', 'confirmed', 'completed', 'cancelled'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      onUpdateStatus(activeDetail.id, s);
                      setActiveDetail({ ...activeDetail, status: s });
                    }}
                    className={`px-2.5 py-1 rounded text-xs capitalize cursor-pointer ${
                      activeDetail.status === s
                        ? 'bg-[#c59b43] text-black font-semibold'
                        : 'bg-[#1b1e2a] text-[#9ca3af] hover:text-white'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-[#2c3245] rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-[#212534]">
              <div>
                <span className="text-[10px] text-[#d4a754] uppercase tracking-wider block">
                  Walk-In / Telephone Intake
                </span>
                <h3 className="font-serif text-xl text-white font-medium">
                  Create Table Reservation
                </h3>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-[#9ca3af] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-[#9ca3af] uppercase text-[10px] font-semibold mb-1">
                    Guest Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Guest name"
                    value={newFullName}
                    onChange={(e) => setNewFullName(e.target.value)}
                    className="w-full bg-[#161822] border border-[#262a38] rounded p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[#9ca3af] uppercase text-[10px] font-semibold mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="guest@domain.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full bg-[#161822] border border-[#262a38] rounded p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[#9ca3af] uppercase text-[10px] font-semibold mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+1 (415) 555-0192"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-[#161822] border border-[#262a38] rounded p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[#9ca3af] uppercase text-[10px] font-semibold mb-1">
                    Party Size *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={newPartySize}
                    onChange={(e) => setNewPartySize(Number(e.target.value))}
                    className="w-full bg-[#161822] border border-[#262a38] rounded p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-[#9ca3af] uppercase text-[10px] font-semibold mb-1">
                    Assign Table *
                  </label>
                  <select
                    value={newTableId}
                    onChange={(e) => setNewTableId(e.target.value)}
                    className="w-full bg-[#161822] border border-[#262a38] rounded p-2 text-white cursor-pointer"
                  >
                    {tables.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.table_name} ({t.capacity}p - {t.area})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[#9ca3af] uppercase text-[10px] font-semibold mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full bg-[#161822] border border-[#262a38] rounded p-2 text-white cursor-pointer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[#9ca3af] uppercase text-[10px] font-semibold mb-1">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={newStartTime}
                      onChange={(e) => setNewStartTime(e.target.value)}
                      className="w-full bg-[#161822] border border-[#262a38] rounded p-2 text-white cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-[#9ca3af] uppercase text-[10px] font-semibold mb-1">
                      End Time *
                    </label>
                    <input
                      type="time"
                      required
                      value={newEndTime}
                      onChange={(e) => setNewEndTime(e.target.value)}
                      className="w-full bg-[#161822] border border-[#262a38] rounded p-2 text-white cursor-pointer"
                    />
                  </div>
                </div>

                <div className="col-span-2">
                  <label className="block text-[#9ca3af] uppercase text-[10px] font-semibold mb-1">
                    Special Requests / Dietary Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="VIP table, birthday, allergies..."
                    value={newSpecialRequests}
                    onChange={(e) => setNewSpecialRequests(e.target.value)}
                    className="w-full bg-[#161822] border border-[#262a38] rounded p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#212534]">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 rounded text-xs text-[#9ca3af] hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-5 py-2 rounded text-xs font-semibold bg-[#c59b43] text-black hover:bg-[#d4a754] transition-colors cursor-pointer"
                >
                  {modalSubmitting ? 'Recording...' : 'Create Reservation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
