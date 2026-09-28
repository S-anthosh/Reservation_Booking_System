import React, { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import {
  RestaurantSettings,
  BusinessHour,
  RestaurantTable,
  MenuItem,
  Reservation,
  BlockedDate,
} from './types/database';
import {
  DEFAULT_SETTINGS,
  DEFAULT_BUSINESS_HOURS,
  DEFAULT_TABLES,
  DEFAULT_MENU,
  getRestaurantSettings,
  updateRestaurantSettings,
  getBusinessHours,
  updateBusinessHour,
  getRestaurantTables,
  saveRestaurantTable,
  deleteRestaurantTable,
  getMenuItems,
  saveMenuItem,
  deleteMenuItem,
  getBlockedDates,
  addBlockedDate,
  deleteBlockedDate,
  getReservations,
  updateReservationStatus,
  createReservation,
  checkIsAdmin,
} from './lib/data-service';

// Public Components
import { Navbar } from './components/public/Navbar';
import { HeroSection } from './components/public/HeroSection';
import { AboutAtmosphereSection } from './components/public/AboutAtmosphereSection';
import { MenuHighlightsSection } from './components/public/MenuHighlightsSection';
import { ReservationSection } from './components/public/ReservationSection';
import { LocationHoursSection } from './components/public/LocationHoursSection';
import { Footer } from './components/public/Footer';

// Admin Components
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout, AdminTab } from './components/admin/AdminLayout';
import { OverviewView } from './components/admin/OverviewView';
import { ReservationsView } from './components/admin/ReservationsView';
import { TablesView } from './components/admin/TablesView';
import { MenuItemsView } from './components/admin/MenuItemsView';
import { BusinessHoursView } from './components/admin/BusinessHoursView';
import { BlockedDatesView } from './components/admin/BlockedDatesView';
import { SettingsView } from './components/admin/SettingsView';

export default function App() {
  const [currentView, setCurrentView] = useState<'public' | 'admin_login' | 'admin_dashboard'>('public');
  const [adminTab, setAdminTab] = useState<AdminTab>('overview');

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);

  const [settings, setSettings] = useState<RestaurantSettings>(DEFAULT_SETTINGS);
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>(DEFAULT_BUSINESS_HOURS);
  const [tables, setTables] = useState<RestaurantTable[]>(DEFAULT_TABLES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(DEFAULT_MENU);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      setCheckingAuth(true);
      try {
        if (isSupabaseConfigured) {
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user) {
            const isAdmin = await checkIsAdmin(session.user.id);
            if (isAdmin) {
              setCurrentUser(session.user);
            } else {
              await supabase.auth.signOut();
              setCurrentUser(null);
            }
          }
        }
      } catch (err) {
        console.warn('Auth check error:', err);
      } finally {
        setCheckingAuth(false);
      }
    }

    initAuth();

    if (isSupabaseConfigured) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const isAdmin = await checkIsAdmin(session.user.id);
          if (isAdmin) {
            setCurrentUser(session.user);
          } else {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const loadAllData = async () => {
    setLoadingData(true);
    try {
      const [s, h, t, m, r, b] = await Promise.all([
        getRestaurantSettings(),
        getBusinessHours(),
        getRestaurantTables(),
        getMenuItems(),
        getReservations(),
        getBlockedDates(),
      ]);

      setSettings(s);
      setBusinessHours(h);
      setTables(t);
      setMenuItems(m);
      setReservations(r);
      setBlockedDates(b);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleUpdateSettings = async (newSettings: Partial<RestaurantSettings>): Promise<boolean> => {
    const { data, error } = await updateRestaurantSettings(newSettings);
    if (!error && data) {
      setSettings(data);
      return true;
    }
    return false;
  };

  const handleUpdateHour = async (hour: BusinessHour): Promise<boolean> => {
    const { success } = await updateBusinessHour(hour);
    if (success) {
      setBusinessHours((prev) => prev.map((h) => (h.weekday === hour.weekday ? hour : h)));
      return true;
    }
    return false;
  };

  const handleSaveTable = async (tableData: Partial<RestaurantTable>): Promise<boolean> => {
    const { data, error } = await saveRestaurantTable(tableData);
    if (!error && data) {
      setTables((prev) => {
        const exists = prev.some((t) => t.id === data.id);
        if (exists) {
          return prev.map((t) => (t.id === data.id ? data : t));
        }
        return [...prev, data];
      });
      return true;
    }
    return false;
  };

  const handleDeleteTable = async (id: string): Promise<boolean> => {
    const ok = await deleteRestaurantTable(id);
    if (ok) {
      setTables((prev) => prev.filter((t) => t.id !== id));
      return true;
    }
    return false;
  };

  const handleSaveMenuItem = async (itemData: Partial<MenuItem>): Promise<boolean> => {
    const { data, error } = await saveMenuItem(itemData);
    if (!error && data) {
      setMenuItems((prev) => {
        const exists = prev.some((m) => m.id === data.id);
        if (exists) {
          return prev.map((m) => (m.id === data.id ? data : m));
        }
        return [...prev, data];
      });
      return true;
    }
    return false;
  };

  const handleDeleteMenuItem = async (id: string): Promise<boolean> => {
    const ok = await deleteMenuItem(id);
    if (ok) {
      setMenuItems((prev) => prev.filter((m) => m.id !== id));
      return true;
    }
    return false;
  };

  const handleAddBlockedDate = async (date: string, reason: string): Promise<boolean> => {
    const { data, error } = await addBlockedDate(date, reason);
    if (!error && data) {
      setBlockedDates((prev) => [...prev, data]);
      return true;
    }
    return false;
  };

  const handleDeleteBlockedDate = async (id: string): Promise<boolean> => {
    const ok = await deleteBlockedDate(id);
    if (ok) {
      setBlockedDates((prev) => prev.filter((b) => b.id !== id));
      return true;
    }
    return false;
  };

  const handleUpdateReservationStatus = async (id: string, status: Reservation['status']) => {
    const ok = await updateReservationStatus(id, status);
    if (ok) {
      setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    }
  };

  const handleCreateReservationManual = async (resData: any): Promise<boolean> => {
    const { data, error } = await createReservation(resData);
    if (!error && data) {
      setReservations((prev) => [data, ...prev]);
      return true;
    }
    return false;
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setCurrentView('public');
  };

  const scrollToBooking = () => {
    setCurrentView('public');
    setTimeout(() => {
      const el = document.getElementById('reservations');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const scrollToMenu = () => {
    setCurrentView('public');
    setTimeout(() => {
      const el = document.getElementById('menu-highlights');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  if (currentView === 'admin_login') {
    return (
      <AdminLogin
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setCurrentView('admin_dashboard');
        }}
        onBackToPublic={() => setCurrentView('public')}
      />
    );
  }

  if (currentView === 'admin_dashboard') {
    if (checkingAuth) {
      return (
        <div className="min-h-screen bg-[#090a0d] flex items-center justify-center text-white">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[#c59b43] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#9ca3af]">Checking admin authorizations...</p>
          </div>
        </div>
      );
    }

    if (!currentUser) {
      return (
        <AdminLogin
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            setCurrentView('admin_dashboard');
          }}
          onBackToPublic={() => setCurrentView('public')}
        />
      );
    }

    return (
      <AdminLayout
        currentTab={adminTab}
        onSelectTab={setAdminTab}
        user={currentUser}
        settings={settings}
        onLogout={handleLogout}
        onViewPublicSite={() => setCurrentView('public')}
      >
        {adminTab === 'overview' && (
          <OverviewView
            reservations={reservations}
            tables={tables}
            menuItems={menuItems}
            settings={settings}
            onUpdateReservationStatus={handleUpdateReservationStatus}
            onNavigateTab={setAdminTab}
          />
        )}

        {adminTab === 'reservations' && (
          <ReservationsView
            reservations={reservations}
            tables={tables}
            onUpdateStatus={handleUpdateReservationStatus}
            onCreateReservation={handleCreateReservationManual}
          />
        )}

        {adminTab === 'tables' && (
          <TablesView
            tables={tables}
            onSaveTable={handleSaveTable}
            onDeleteTable={handleDeleteTable}
          />
        )}

        {adminTab === 'menu' && (
          <MenuItemsView
            menuItems={menuItems}
            onSaveMenuItem={handleSaveMenuItem}
            onDeleteMenuItem={handleDeleteMenuItem}
          />
        )}

        {adminTab === 'hours' && (
          <BusinessHoursView
            hours={businessHours}
            onUpdateHour={handleUpdateHour}
          />
        )}

        {adminTab === 'blocked' && (
          <BlockedDatesView
            blockedDates={blockedDates}
            onAddBlockedDate={handleAddBlockedDate}
            onDeleteBlockedDate={handleDeleteBlockedDate}
          />
        )}

        {adminTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
          />
        )}
      </AdminLayout>
    );
  }

  const publicFeaturedMenu = menuItems.filter((i) => i.is_active && i.is_featured);

  return (
    <div className="min-h-screen bg-[#0c0d0e] text-[#e8e4dc] selection:bg-[#c59b43] selection:text-black">
      <Navbar
        settings={settings}
        onNavigateToBooking={scrollToBooking}
        onNavigateToAdmin={() => {
          if (currentUser) {
            setCurrentView('admin_dashboard');
          } else {
            setCurrentView('admin_login');
          }
        }}
      />

      <HeroSection
        settings={settings}
        onReserveClick={scrollToBooking}
        onMenuClick={scrollToMenu}
      />

      <AboutAtmosphereSection />

      <MenuHighlightsSection
        items={publicFeaturedMenu.length > 0 ? publicFeaturedMenu : menuItems.filter((i) => i.is_active)}
        loading={loadingData}
      />

      <ReservationSection
        settings={settings}
        onReservationComplete={(newRes) => {
          setReservations((prev) => [newRes, ...prev]);
        }}
      />

      <LocationHoursSection
        settings={settings}
        hours={businessHours}
      />

      <Footer
        settings={settings}
        onNavigateToAdmin={() => {
          if (currentUser) {
            setCurrentView('admin_dashboard');
          } else {
            setCurrentView('admin_login');
          }
        }}
        onNavigateToBooking={scrollToBooking}
      />
    </div>
  );
}
