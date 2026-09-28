import React, { useState } from 'react';
import {
  LayoutDashboard,
  CalendarCheck2,
  Grid3X3,
  UtensilsCrossed,
  Clock,
  CalendarX,
  Settings,
  LogOut,
  ExternalLink,
  ChevronRight,
  Database,
  Menu,
  X,
} from 'lucide-react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { RestaurantSettings } from '../../types/database';

export type AdminTab =
  | 'overview'
  | 'reservations'
  | 'tables'
  | 'menu'
  | 'hours'
  | 'blocked'
  | 'settings';

interface AdminLayoutProps {
  currentTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  user: any;
  settings: RestaurantSettings;
  onLogout: () => void;
  onViewPublicSite: () => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentTab,
  onSelectTab,
  user,
  settings,
  onLogout,
  onViewPublicSite,
  children,
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems: { id: AdminTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'reservations',
      label: 'Reservations',
      icon: <CalendarCheck2 className="w-4 h-4" />,
    },
    {
      id: 'tables',
      label: 'Restaurant Tables',
      icon: <Grid3X3 className="w-4 h-4" />,
    },
    {
      id: 'menu',
      label: 'Menu Items',
      icon: <UtensilsCrossed className="w-4 h-4" />,
    },
    {
      id: 'hours',
      label: 'Business Hours',
      icon: <Clock className="w-4 h-4" />,
    },
    {
      id: 'blocked',
      label: 'Blocked Dates',
      icon: <CalendarX className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Restaurant Settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#090a0d] text-[#e8e4dc] flex flex-col lg:flex-row antialiased">
      <div className="lg:hidden bg-[#0e1015] border-b border-[#202430] p-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded border border-[#c59b43]/40 bg-[#161822] flex items-center justify-center text-[#d4a754] font-serif font-bold text-lg">
            A
          </div>
          <div>
            <span className="font-serif text-sm font-semibold tracking-wider text-white">
              {settings.restaurant_name}
            </span>
            <span className="block text-[9px] uppercase tracking-widest text-[#9ca3af]">
              Dashboard
            </span>
          </div>
        </div>

        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded bg-[#161822] border border-[#232736] text-[#9ca3af]"
          aria-label="Toggle navigation"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <aside
        className={`w-72 bg-[#0c0e12] border-r border-[#1e222d] flex flex-col justify-between shrink-0 fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:translate-x-0 lg:static ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="p-6 border-b border-[#1b1f2b] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded border border-[#c59b43]/50 bg-[#141620] flex items-center justify-center text-[#d4a754] font-serif text-2xl font-bold shadow-inner">
                A
              </div>
              <div>
                <span className="block font-serif text-lg font-semibold tracking-wide text-white">
                  {settings.restaurant_name}
                </span>
                <span className="block text-[10px] tracking-[0.2em] text-[#9ca3af] uppercase">
                  Management Portal
                </span>
              </div>
            </div>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden text-[#9ca3af] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-3 bg-[#10121a] border-b border-[#1b1f2b] flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-[#9ca3af]">
              <Database className="w-3.5 h-3.5 text-[#c59b43]" />
              <span>Database Backend</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                isSupabaseConfigured
                  ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800'
                  : 'bg-amber-950/70 text-amber-300 border border-amber-800'
              }`}
            >
              {isSupabaseConfigured ? 'Supabase Live' : 'Preview Mode'}
            </span>
          </div>

          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#1f2433] to-[#191d2a] text-[#f5f2eb] border border-[#c59b43]/40 shadow-md font-semibold'
                      : 'text-[#9ca3af] hover:bg-[#13161f] hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-[#d4a754]' : 'text-[#6b7280]'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#d4a754]" />}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-[#1b1f2b] space-y-3 bg-[#0a0c10]">
          <div className="flex items-center justify-between">
            <button
              onClick={onViewPublicSite}
              className="inline-flex items-center gap-1.5 text-xs text-[#9ca3af] hover:text-[#d4a754] transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>View Public Website</span>
            </button>

            <button
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 text-xs text-[#ef4444] hover:text-[#f87171] transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

          <div className="pt-2 text-[10px] text-[#6b7280] truncate">
            Signed in as: <span className="text-[#9ca3af]">{user?.email || 'admin@aurelia.com'}</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto min-w-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
};
