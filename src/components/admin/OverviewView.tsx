import React from 'react';
import {
  CalendarCheck2,
  Users,
  Clock,
  Grid3X3,
  UtensilsCrossed,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  Reservation,
  RestaurantTable,
  MenuItem,
  RestaurantSettings,
} from '../../types/database';

interface OverviewViewProps {
  reservations: Reservation[];
  tables: RestaurantTable[];
  menuItems: MenuItem[];
  settings: RestaurantSettings;
  onUpdateReservationStatus: (id: string, status: Reservation['status']) => void;
  onNavigateTab: (tab: any) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  reservations,
  tables,
  menuItems,
  settings,
  onUpdateReservationStatus,
  onNavigateTab,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const todayReservations = reservations.filter((r) => r.reservation_date === todayStr);
  const pendingReservations = reservations.filter((r) => r.status === 'pending');
  const confirmedReservations = reservations.filter((r) => r.status === 'confirmed');

  const activeTables = tables.filter((t) => t.is_active);
  const totalTableCapacity = activeTables.reduce((acc, t) => acc + t.capacity, 0);

  const featuredMenuItems = menuItems.filter((m) => m.is_featured && m.is_active);

  const getStatusBadge = (status: Reservation['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-800">
            Pending Approval
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-950/80 text-blue-400 border border-blue-800">
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-950/80 text-rose-400 border border-rose-800">
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f2230]">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase text-[#d4a754] block mb-1">
            Executive Summary
          </span>
          <h1 className="font-serif text-3xl font-light text-[#fbf9f5]">
            Dining Room &amp; Reservation Overview
          </h1>
          <p className="text-xs text-[#9ca3af] mt-1">
            Real-time table covers, booking requests, and floor readiness.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('reservations')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[#c59b43] text-black hover:bg-[#d4a754] transition-colors cursor-pointer shadow-md"
          >
            <CalendarCheck2 className="w-4 h-4" />
            <span>Manage All Bookings</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-[#12141c] border border-[#232736] shadow-lg">
          <div className="flex items-center justify-between text-xs text-[#9ca3af] mb-3">
            <span>Today's Reservations</span>
            <div className="p-2 rounded bg-[#1c1f2b] text-[#d4a754]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold font-serif text-white">
              {todayReservations.length}
            </span>
            <span className="text-xs text-[#9ca3af]">
              {todayReservations.reduce((sum, r) => sum + r.party_size, 0)} guests total
            </span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#12141c] border border-[#232736] shadow-lg">
          <div className="flex items-center justify-between text-xs text-[#9ca3af] mb-3">
            <span>Pending Approvals</span>
            <div className="p-2 rounded bg-[#1c1f2b] text-[#eab308]">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold font-serif text-[#fef08a]">
              {pendingReservations.length}
            </span>
            <span className="text-xs text-[#9ca3af]">Requires attention</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#12141c] border border-[#232736] shadow-lg">
          <div className="flex items-center justify-between text-xs text-[#9ca3af] mb-3">
            <span>Active Tables &amp; Capacity</span>
            <div className="p-2 rounded bg-[#1c1f2b] text-[#38bdf8]">
              <Grid3X3 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold font-serif text-white">
              {activeTables.length}{' '}
              <span className="text-sm font-sans text-[#6b7280]">/ {tables.length}</span>
            </span>
            <span className="text-xs text-[#9ca3af]">{totalTableCapacity} max covers</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-[#12141c] border border-[#232736] shadow-lg">
          <div className="flex items-center justify-between text-xs text-[#9ca3af] mb-3">
            <span>Featured Menu Highlights</span>
            <div className="p-2 rounded bg-[#1c1f2b] text-[#4ade80]">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-bold font-serif text-white">
              {featuredMenuItems.length}
            </span>
            <span className="text-xs text-[#9ca3af]">{menuItems.length} total items</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-[#12141c] border border-[#232736] rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#1f2230]">
            <div>
              <h2 className="font-serif text-xl font-medium text-white">Today's Service Schedule</h2>
              <p className="text-xs text-[#9ca3af]">
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
            <span className="text-xs font-semibold text-[#d4a754] bg-[#1a1d28] px-3 py-1 rounded border border-[#2c3144]">
              {todayReservations.length} Bookings
            </span>
          </div>

          {todayReservations.length === 0 ? (
            <div className="py-12 text-center text-[#9ca3af] space-y-2">
              <CalendarCheck2 className="w-8 h-8 text-[#4b5563] mx-auto" />
              <p className="text-sm text-white">No reservations scheduled for today yet.</p>
              <p className="text-xs text-[#6b7280]">
                Walk-in covers or new bookings will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayReservations.map((res) => (
                <div
                  key={res.id}
                  className="p-4 rounded-lg bg-[#161822] border border-[#242837] hover:border-[#c59b43]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-semibold text-[#d4a754]">
                        {res.start_time} - {res.end_time}
                      </span>
                      <span className="font-medium text-sm text-white">{res.full_name}</span>
                      {getStatusBadge(res.status)}
                    </div>
                    <div className="text-xs text-[#9ca3af] flex items-center gap-4">
                      <span>Party of {res.party_size} guests</span>
                      <span>·</span>
                      <span>
                        Table:{' '}
                        {res.restaurant_tables?.table_name ||
                          tables.find((t) => t.id === res.table_id)?.table_name ||
                          'Assigned Table'}
                      </span>
                    </div>
                    {res.special_requests && (
                      <p className="text-[11px] text-[#cbd5e1] italic pt-1">
                        Note: "{res.special_requests}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {res.status === 'pending' && (
                      <button
                        onClick={() => onUpdateReservationStatus(res.id, 'confirmed')}
                        className="px-3 py-1.5 rounded text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 hover:bg-emerald-900 transition-colors cursor-pointer"
                      >
                        Confirm
                      </button>
                    )}
                    {res.status !== 'completed' && res.status !== 'cancelled' && (
                      <button
                        onClick={() => onUpdateReservationStatus(res.id, 'completed')}
                        className="px-3 py-1.5 rounded text-xs font-medium bg-[#1e2230] text-[#cbd5e1] hover:text-white border border-[#2c3245] transition-colors cursor-pointer"
                      >
                        Seated / Done
                      </button>
                    )}
                    {res.status !== 'cancelled' && (
                      <button
                        onClick={() => onUpdateReservationStatus(res.id, 'cancelled')}
                        className="px-2.5 py-1.5 rounded text-xs text-rose-400 hover:bg-rose-950/50 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#12141c] border border-[#232736] rounded-xl p-5 shadow-xl space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white">
              Management Shortcuts
            </h2>

            <button
              onClick={() => onNavigateTab('reservations')}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-[#161822] hover:bg-[#1c202d] border border-[#242837] text-xs font-medium text-[#cbd5e1] hover:text-white transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <CalendarCheck2 className="w-4 h-4 text-[#d4a754]" />
                <span>All Reservations &amp; Filtering</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#6b7280]" />
            </button>

            <button
              onClick={() => onNavigateTab('tables')}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-[#161822] hover:bg-[#1c202d] border border-[#242837] text-xs font-medium text-[#cbd5e1] hover:text-white transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Grid3X3 className="w-4 h-4 text-[#38bdf8]" />
                <span>Manage Restaurant Tables</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#6b7280]" />
            </button>

            <button
              onClick={() => onNavigateTab('menu')}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-[#161822] hover:bg-[#1c202d] border border-[#242837] text-xs font-medium text-[#cbd5e1] hover:text-white transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <UtensilsCrossed className="w-4 h-4 text-[#4ade80]" />
                <span>Edit Featured Menu Highlights</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#6b7280]" />
            </button>

            <button
              onClick={() => onNavigateTab('settings')}
              className="w-full flex items-center justify-between p-3 rounded-lg bg-[#161822] hover:bg-[#1c202d] border border-[#242837] text-xs font-medium text-[#cbd5e1] hover:text-white transition-all cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#e8c782]" />
                <span>Booking Rules &amp; Intervals</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#6b7280]" />
            </button>
          </div>

          <div className="bg-[#12141c] border border-[#232736] rounded-xl p-5 shadow-xl space-y-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-white">
              Dining Room Layout
            </h2>
            <div className="space-y-2.5 text-xs">
              {['Hearth Room', 'Main Dining Room', "Chef's Counter", 'Terrace Veranda', 'Private Cellar'].map(
                (area) => {
                  const areaTables = tables.filter((t) => t.area === area);
                  const activeCount = areaTables.filter((t) => t.is_active).length;
                  const capacity = areaTables.reduce((sum, t) => sum + (t.is_active ? t.capacity : 0), 0);
                  return (
                    <div
                      key={area}
                      className="p-2.5 rounded bg-[#161822] border border-[#222635] flex items-center justify-between"
                    >
                      <div>
                        <span className="font-medium text-white block">{area}</span>
                        <span className="text-[10px] text-[#9ca3af]">
                          {activeCount} active tables
                        </span>
                      </div>
                      <span className="font-semibold text-[#d4a754] text-xs">
                        {capacity} seats
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
