import { supabase, isSupabaseConfigured } from './supabase';
import {
  RestaurantTable,
  MenuItem,
  Reservation,
  BusinessHour,
  BlockedDate,
  RestaurantSettings,
  TimeSlot,
} from '../types/database';

export const DEFAULT_SETTINGS: RestaurantSettings = {
  id: '00000000-0000-0000-0000-000000000001',
  restaurant_name: 'Aurelia Table & Cellar',
  restaurant_email: 'concierge@aurelia-dining.com',
  restaurant_phone: '+1 (415) 890-4200',
  restaurant_address: '742 Montgomery Street, Jackson Square, San Francisco, CA 94111',
  slot_interval_minutes: 90,
  booking_notice_hours: 2,
  default_reservation_duration_minutes: 90,
  max_party_size: 5,
};

export const DEFAULT_BUSINESS_HOURS: BusinessHour[] = [
  { id: '1', weekday: 0, is_open: true, start_time: '17:00', end_time: '23:00' }, // Sun
  { id: '2', weekday: 1, is_open: false, start_time: '17:00', end_time: '22:00' }, // Mon (Closed)
  { id: '3', weekday: 2, is_open: true, start_time: '17:00', end_time: '23:00' }, // Tue
  { id: '4', weekday: 3, is_open: true, start_time: '17:00', end_time: '23:00' }, // Wed
  { id: '5', weekday: 4, is_open: true, start_time: '17:00', end_time: '23:00' }, // Thu
  { id: '6', weekday: 5, is_open: true, start_time: '16:30', end_time: '23:30' }, // Fri
  { id: '7', weekday: 6, is_open: true, start_time: '16:30', end_time: '23:30' }, // Sat
];

export const DEFAULT_TABLES: RestaurantTable[] = [
  { id: 'tbl-1', table_name: 'Room 01 · Hearthside Dining Room', capacity: 5, area: 'Hearth Room', is_active: true },
  { id: 'tbl-2', table_name: 'Room 02 · Garden Veranda Room', capacity: 5, area: 'Terrace Veranda', is_active: true },
  { id: 'tbl-3', table_name: "Room 03 · Chef's Salon Room", capacity: 5, area: "Chef's Salon", is_active: true },
  { id: 'tbl-4', table_name: 'Room 04 · Sommelier Cellar Room', capacity: 5, area: 'Private Cellar', is_active: true },
  { id: 'tbl-5', table_name: 'Room 05 · Window Promenade Room', capacity: 5, area: 'Main Promenade', is_active: true },
];

export const DEFAULT_MENU: MenuItem[] = [
  {
    id: 'menu-1',
    name: 'Wood-Fired Hokkaido Scallops',
    description: 'Hand-dived scallops, preserved Meyer lemon beurre blanc, sturgeon caviar, sea fennel.',
    price: 34.00,
    category: 'Starters',
    is_featured: true,
    is_active: true,
  },
  {
    id: 'menu-2',
    name: 'Dry-Aged Wagyu Tartare',
    description: 'Kobe A5 striploin, charred bone marrow emulsion, pickled chanterelles, grilled brioche crisps.',
    price: 32.00,
    category: 'Starters',
    is_featured: true,
    is_active: true,
  },
  {
    id: 'menu-3',
    name: 'Burrata Pugliese & Charred Figs',
    description: 'Wood-roasted mission figs, 25-year aged balsamic of Modena, pistachio praline, micro basil.',
    price: 26.00,
    category: 'Starters',
    is_featured: false,
    is_active: true,
  },
  {
    id: 'menu-4',
    name: 'Oak-Smoked Sonoma Duck Breast',
    description: 'Spiced sour cherry reduction, caramelized sunchoke purée, braised endive, duck crackling.',
    price: 58.00,
    category: 'Mains',
    is_featured: true,
    is_active: true,
  },
  {
    id: 'menu-5',
    name: 'Prime Dry-Aged Ribeye (16oz)',
    description: '45-day dry-aged, hearth ember roasted, wild foraged black trumpet butter, smoked sea salt.',
    price: 76.00,
    category: 'Mains',
    is_featured: true,
    is_active: true,
  },
  {
    id: 'menu-6',
    name: 'Handmade Campanelle & Black Truffle',
    description: 'Fresh extruded pasta, cultured Normandy butter, 36-month Parmigiano-Reggiano, shaved Périgord truffle.',
    price: 48.00,
    category: 'Mains',
    is_featured: true,
    is_active: true,
  },
  {
    id: 'menu-7',
    name: 'Wild Pacific King Salmon',
    description: 'Crispy skin, fermented ramp dashi, baby leeks, golden chanterelles, garden herb oil.',
    price: 52.00,
    category: 'Mains',
    is_featured: false,
    is_active: true,
  },
  {
    id: 'menu-8',
    name: 'Smoked Valrhona Chocolate Crémeux',
    description: '70% Guanaja chocolate, salted caramel crunch, rosemary gelato, 24k gold leaf.',
    price: 22.00,
    category: 'Desserts',
    is_featured: true,
    is_active: true,
  },
  {
    id: 'menu-9',
    name: 'Wood-Roasted Caramelized Fig Tart',
    description: 'Tahitian vanilla bean crème diplomate, honeycomb crisp, roasted pistachio gelato.',
    price: 20.00,
    category: 'Desserts',
    is_featured: true,
    is_active: true,
  },
  {
    id: 'menu-10',
    name: 'Smoked Rosemary Old Fashioned',
    description: 'WhistlePig 10yr Rye, charred rosemary syrup, angostura & orange bitters, torched peel.',
    price: 24.00,
    category: 'Beverages',
    is_featured: true,
    is_active: true,
  },
];

const STORAGE_KEYS = {
  SETTINGS: 'aurelia_local_settings',
  HOURS: 'aurelia_local_hours',
  TABLES: 'aurelia_local_tables',
  MENU: 'aurelia_local_menu',
  RESERVATIONS: 'aurelia_local_reservations',
  BLOCKED: 'aurelia_local_blocked',
};

function getLocal<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocal<T>(key: string, value: T) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage error', err);
  }
}

export async function getRestaurantSettings(): Promise<RestaurantSettings> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('restaurant_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return {
          ...(data as RestaurantSettings),
          max_party_size: Math.min(Number(data.max_party_size) || 5, 5),
        };
      }
    } catch (e) {
      console.warn('Supabase fetch failed, falling back:', e);
    }
  }
  const local = getLocal<RestaurantSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  return {
    ...local,
    max_party_size: Math.min(Number(local.max_party_size) || 5, 5),
  };
}

export async function updateRestaurantSettings(
  settings: Partial<RestaurantSettings>
): Promise<{ data: RestaurantSettings | null; error: Error | null }> {
  if (isSupabaseConfigured) {
    try {
      const current = await getRestaurantSettings();
      const updated = { ...current, ...settings };
      const { data, error } = await supabase
        .from('restaurant_settings')
        .upsert(updated)
        .select()
        .single();

      if (error) throw error;
      setLocal(STORAGE_KEYS.SETTINGS, data);
      return { data: data as RestaurantSettings, error: null };
    } catch (e: any) {
      console.warn('Supabase update failed, saving local:', e);
      const localUpdated = { ...getLocal(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS), ...settings };
      setLocal(STORAGE_KEYS.SETTINGS, localUpdated);
      return { data: localUpdated, error: e };
    }
  }

  const localUpdated = { ...getLocal(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS), ...settings };
  setLocal(STORAGE_KEYS.SETTINGS, localUpdated);
  return { data: localUpdated, error: null };
}

export async function getBusinessHours(): Promise<BusinessHour[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('business_hours')
        .select('*')
        .order('weekday', { ascending: true });

      if (!error && data && data.length > 0) return data as BusinessHour[];
    } catch (e) {
      console.warn('Supabase fetch failed:', e);
    }
  }
  return getLocal<BusinessHour[]>(STORAGE_KEYS.HOURS, DEFAULT_BUSINESS_HOURS);
}

export async function updateBusinessHour(
  hour: BusinessHour
): Promise<{ success: boolean; error: Error | null }> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('business_hours').upsert(hour);
      if (error) throw error;
    } catch (e: any) {
      console.warn('Supabase hours update failed:', e);
    }
  }

  const localHours = getLocal<BusinessHour[]>(STORAGE_KEYS.HOURS, DEFAULT_BUSINESS_HOURS);
  const updated = localHours.map((h) => (h.weekday === hour.weekday ? hour : h));
  setLocal(STORAGE_KEYS.HOURS, updated);
  return { success: true, error: null };
}

export async function getRestaurantTables(): Promise<RestaurantTable[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('restaurant_tables')
        .select('*')
        .order('table_name', { ascending: true });

      if (!error && data && data.length > 0) {
        return (data as RestaurantTable[]).map((t) => ({
          ...t,
          capacity: Math.min(t.capacity || 5, 5),
        }));
      }
    } catch (e) {
      console.warn('Supabase tables fetch failed:', e);
    }
  }
  const local = getLocal<RestaurantTable[]>(STORAGE_KEYS.TABLES, DEFAULT_TABLES);
  return local.map((t) => ({
    ...t,
    capacity: Math.min(t.capacity || 5, 5),
  }));
}

export async function saveRestaurantTable(
  table: Partial<RestaurantTable>
): Promise<{ data: RestaurantTable | null; error: Error | null }> {
  const isNew = !table.id || table.id.startsWith('tbl-');
  const record = {
    ...table,
    id: table.id && !table.id.startsWith('tbl-') ? table.id : undefined,
  };

  if (isSupabaseConfigured) {
    try {
      if (isNew && !table.id) {
        const { data, error } = await supabase
          .from('restaurant_tables')
          .insert(record)
          .select()
          .single();
        if (error) throw error;
        return { data: data as RestaurantTable, error: null };
      } else {
        const { data, error } = await supabase
          .from('restaurant_tables')
          .upsert(record)
          .select()
          .single();
        if (error) throw error;
        return { data: data as RestaurantTable, error: null };
      }
    } catch (e: any) {
      console.warn('Supabase table save error:', e);
    }
  }

  const localTables = getLocal<RestaurantTable[]>(STORAGE_KEYS.TABLES, DEFAULT_TABLES);
  let saved: RestaurantTable;
  if (table.id) {
    saved = { ...localTables.find((t) => t.id === table.id), ...table } as RestaurantTable;
    const updated = localTables.map((t) => (t.id === table.id ? saved : t));
    setLocal(STORAGE_KEYS.TABLES, updated);
  } else {
    saved = {
      id: `tbl-${Date.now()}`,
      table_name: table.table_name || 'New Table',
      capacity: table.capacity || 2,
      area: table.area || 'Main Dining Room',
      is_active: table.is_active ?? true,
      created_at: new Date().toISOString(),
    };
    setLocal(STORAGE_KEYS.TABLES, [...localTables, saved]);
  }
  return { data: saved, error: null };
}

export async function deleteRestaurantTable(id: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('restaurant_tables').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete table failed:', e);
    }
  }
  const localTables = getLocal<RestaurantTable[]>(STORAGE_KEYS.TABLES, DEFAULT_TABLES);
  setLocal(
    STORAGE_KEYS.TABLES,
    localTables.filter((t) => t.id !== id)
  );
  return true;
}

export async function getMenuItems(onlyActiveFeatured = false): Promise<MenuItem[]> {
  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('menu_items').select('*').order('name', { ascending: true });
      if (onlyActiveFeatured) {
        query = query.eq('is_active', true).eq('is_featured', true);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) return data as MenuItem[];
    } catch (e) {
      console.warn('Supabase menu fetch failed:', e);
    }
  }

  const localMenu = getLocal<MenuItem[]>(STORAGE_KEYS.MENU, DEFAULT_MENU);
  if (onlyActiveFeatured) {
    return localMenu.filter((i) => i.is_active && i.is_featured);
  }
  return localMenu;
}

export async function saveMenuItem(
  item: Partial<MenuItem>
): Promise<{ data: MenuItem | null; error: Error | null }> {
  const isNew = !item.id || item.id.startsWith('menu-');
  const record = {
    ...item,
    id: item.id && !item.id.startsWith('menu-') ? item.id : undefined,
  };

  if (isSupabaseConfigured) {
    try {
      if (isNew && !item.id) {
        const { data, error } = await supabase
          .from('menu_items')
          .insert(record)
          .select()
          .single();
        if (error) throw error;
        return { data: data as MenuItem, error: null };
      } else {
        const { data, error } = await supabase
          .from('menu_items')
          .upsert(record)
          .select()
          .single();
        if (error) throw error;
        return { data: data as MenuItem, error: null };
      }
    } catch (e: any) {
      console.warn('Supabase menu save error:', e);
    }
  }

  const localItems = getLocal<MenuItem[]>(STORAGE_KEYS.MENU, DEFAULT_MENU);
  let saved: MenuItem;
  if (item.id) {
    saved = { ...localItems.find((i) => i.id === item.id), ...item } as MenuItem;
    const updated = localItems.map((i) => (i.id === item.id ? saved : i));
    setLocal(STORAGE_KEYS.MENU, updated);
  } else {
    saved = {
      id: `menu-${Date.now()}`,
      name: item.name || 'New Item',
      description: item.description || '',
      price: item.price || 0,
      category: item.category || 'Mains',
      is_featured: item.is_featured ?? false,
      is_active: item.is_active ?? true,
      created_at: new Date().toISOString(),
    };
    setLocal(STORAGE_KEYS.MENU, [...localItems, saved]);
  }
  return { data: saved, error: null };
}

export async function deleteMenuItem(id: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('menu_items').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete menu item failed:', e);
    }
  }
  const localItems = getLocal<MenuItem[]>(STORAGE_KEYS.MENU, DEFAULT_MENU);
  setLocal(
    STORAGE_KEYS.MENU,
    localItems.filter((i) => i.id !== id)
  );
  return true;
}

export async function getBlockedDates(): Promise<BlockedDate[]> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('blocked_dates')
        .select('*')
        .order('blocked_date', { ascending: true });

      if (!error && data) return data as BlockedDate[];
    } catch (e) {
      console.warn('Supabase blocked dates fetch failed:', e);
    }
  }
  return getLocal<BlockedDate[]>(STORAGE_KEYS.BLOCKED, []);
}

export async function addBlockedDate(
  blockedDate: string,
  reason: string
): Promise<{ data: BlockedDate | null; error: Error | null }> {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('blocked_dates')
        .insert({ blocked_date: blockedDate, reason })
        .select()
        .single();
      if (error) throw error;
      return { data: data as BlockedDate, error: null };
    } catch (e: any) {
      console.warn('Supabase blocked date add failed:', e);
    }
  }

  const current = getLocal<BlockedDate[]>(STORAGE_KEYS.BLOCKED, []);
  const newItem: BlockedDate = {
    id: `blk-${Date.now()}`,
    blocked_date: blockedDate,
    reason,
    created_at: new Date().toISOString(),
  };
  setLocal(STORAGE_KEYS.BLOCKED, [...current, newItem]);
  return { data: newItem, error: null };
}

export async function deleteBlockedDate(id: string): Promise<boolean> {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('blocked_dates').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase delete blocked date failed:', e);
    }
  }
  const current = getLocal<BlockedDate[]>(STORAGE_KEYS.BLOCKED, []);
  setLocal(
    STORAGE_KEYS.BLOCKED,
    current.filter((b) => b.id !== id)
  );
  return true;
}

export async function getReservations(): Promise<Reservation[]> {
  const localReservations = getLocal<Reservation[]>(STORAGE_KEYS.RESERVATIONS, []);
  const tables = getLocal<RestaurantTable[]>(STORAGE_KEYS.TABLES, DEFAULT_TABLES);

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select(`
          *,
          restaurant_tables (
            id,
            table_name,
            capacity,
            area,
            is_active
          )
        `)
        .order('reservation_date', { ascending: false })
        .order('start_time', { ascending: true });

      if (!error && data) {
        const map = new Map<string, Reservation>();
        (data as Reservation[]).forEach((r) => map.set(r.id, r));
        localReservations.forEach((r) => {
          if (!map.has(r.id)) map.set(r.id, r);
        });
        return Array.from(map.values()).map((res) => ({
          ...res,
          restaurant_tables: res.restaurant_tables || tables.find((t) => t.id === res.table_id),
        }));
      }
    } catch (e) {
      console.warn('Supabase reservations fetch failed:', e);
    }
  }

  return localReservations.map((res) => ({
    ...res,
    restaurant_tables: tables.find((t) => t.id === res.table_id),
  }));
}

export async function updateReservationStatus(
  id: string,
  status: Reservation['status']
): Promise<boolean> {
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase.from('reservations').update({ status }).eq('id', id);
      if (error) throw error;
      return true;
    } catch (e) {
      console.warn('Supabase update status failed:', e);
    }
  }

  const localReservations = getLocal<Reservation[]>(STORAGE_KEYS.RESERVATIONS, []);
  const updated = localReservations.map((r) => (r.id === id ? { ...r, status } : r));
  setLocal(STORAGE_KEYS.RESERVATIONS, updated);
  return true;
}

export async function createReservation(reservation: {
  full_name: string;
  email: string;
  phone: string;
  party_size: number;
  table_id: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  special_requests?: string | null;
}): Promise<{ data: Reservation | null; error: Error | null }> {
  // 1. Enforce max party size dining limit of 5
  if (reservation.party_size > 5) {
    return {
      data: null,
      error: new Error('Limit exceeded: Dining limit is 5 guests per table reservation.'),
    };
  }

  // 2. Check if reservations for this particular date and time is >= 5
  const allReservations = await getReservations();
  const cleanTargetDate = reservation.reservation_date.slice(0, 10);
  const dateReservations = allReservations.filter((r) => {
    if (!r.reservation_date || r.status === 'cancelled') return false;
    return r.reservation_date.slice(0, 10) === cleanTargetDate;
  });

  const toMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const match = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (!match) return 0;
    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
  };

  const targetStart = toMinutes(reservation.start_time);
  const targetEnd = toMinutes(reservation.end_time);

  const overlappingReservationsCount = dateReservations.filter((r) => {
    const rStart = toMinutes(r.start_time);
    const rEnd = toMinutes(r.end_time);
    return targetStart < rEnd && targetEnd > rStart;
  }).length;

  if (overlappingReservationsCount >= 5) {
    return {
      data: null,
      error: new Error('Limit exceeded: Maximum of 5 table reservations reached for this particular date and time.'),
    };
  }

  // 3. Strict Capacity & Seat Availability:
  // Calculate booked seats on this table during this seating window
  const overlappingTableReservations = dateReservations.filter((r) => {
    if (r.table_id !== reservation.table_id) return false;
    const rStart = toMinutes(r.start_time);
    const rEnd = toMinutes(r.end_time);
    // Overlapping condition: start_a < end_b && end_a > start_b
    return targetStart < rEnd && targetEnd > rStart;
  });

  const bookedSeatsOnTable = overlappingTableReservations.reduce(
    (sum, r) => sum + Math.max(1, Number(r.party_size) || 1),
    0
  );
  const remainingTableSeats = Math.max(0, 5 - bookedSeatsOnTable);

  if (bookedSeatsOnTable >= 5 || remainingTableSeats === 0) {
    const tableName = overlappingTableReservations[0]?.restaurant_tables?.table_name || 'This table';
    return {
      data: null,
      error: new Error(
        `No slots remaining: ${tableName} has all 5 seats already reserved on ${reservation.reservation_date} for this time window.`
      ),
    };
  }

  if (reservation.party_size > remainingTableSeats) {
    const tableName = overlappingTableReservations[0]?.restaurant_tables?.table_name || 'This table';
    return {
      data: null,
      error: new Error(
        `Limit exceeded: ${tableName} only has ${remainingTableSeats} ${
          remainingTableSeats === 1 ? 'seat' : 'seats'
        } remaining. Cannot accommodate party of ${reservation.party_size} guests.`
      ),
    };
  }

  const payload = {
    full_name: reservation.full_name,
    email: reservation.email,
    phone: reservation.phone,
    party_size: Number(reservation.party_size) || 1,
    table_id: reservation.table_id,
    reservation_date: cleanTargetDate,
    start_time: reservation.start_time,
    end_time: reservation.end_time,
    status: 'confirmed' as const,
    special_requests: reservation.special_requests || null,
  };

  const current = getLocal<Reservation[]>(STORAGE_KEYS.RESERVATIONS, []);
  const tables = getLocal<RestaurantTable[]>(STORAGE_KEYS.TABLES, DEFAULT_TABLES);
  const matchingTable = tables.find((t) => t.id === payload.table_id);

  if (isSupabaseConfigured) {
    try {
      const { data: existingSupabaseReservations, error: checkErr } = await supabase
        .from('reservations')
        .select(`
          id,
          full_name,
          start_time,
          end_time,
          table_id,
          party_size,
          status,
          restaurant_tables (
            table_name
          )
        `)
        .eq('reservation_date', cleanTargetDate)
        .eq('table_id', reservation.table_id)
        .neq('status', 'cancelled');

      if (!checkErr && existingSupabaseReservations && existingSupabaseReservations.length > 0) {
        const overlappingSup = existingSupabaseReservations.filter((r: any) => {
          const rStart = toMinutes(r.start_time);
          const rEnd = toMinutes(r.end_time);
          return targetStart < rEnd && targetEnd > rStart;
        });

        const supBookedSeats = overlappingSup.reduce(
          (sum: number, r: any) => sum + Math.max(1, Number(r.party_size) || 1),
          0
        );
        if (supBookedSeats + payload.party_size > 5) {
          const supRemaining = Math.max(0, 5 - supBookedSeats);
          const tableName = (overlappingSup[0] as any)?.restaurant_tables?.table_name || 'This table';
          return {
            data: null,
            error: new Error(
              supRemaining === 0
                ? `No slots remaining: ${tableName} has all 5 seats already reserved on ${cleanTargetDate} for this time window.`
                : `Limit exceeded: ${tableName} only has ${supRemaining} ${
                    supRemaining === 1 ? 'seat' : 'seats'
                  } remaining.`
            ),
          };
        }
      }

      const { data, error } = await supabase
        .from('reservations')
        .insert(payload)
        .select(`
          *,
          restaurant_tables (
            id,
            table_name,
            capacity,
            area,
            is_active
          )
        `)
        .single();

      if (!error && data) {
        const savedRes = data as Reservation;
        setLocal(STORAGE_KEYS.RESERVATIONS, [savedRes, ...current.filter((r) => r.id !== savedRes.id)]);
        return { data: savedRes, error: null };
      }
    } catch (e: any) {
      console.warn('Supabase create reservation failed:', e);
    }
  }

  const newRes: Reservation = {
    id: `res-${Date.now()}`,
    ...payload,
    created_at: new Date().toISOString(),
    restaurant_tables: matchingTable,
  };
  setLocal(STORAGE_KEYS.RESERVATIONS, [newRes, ...current.filter((r) => r.id !== newRes.id)]);
  return { data: newRes, error: null };
}

export async function getAvailableTimeSlots(
  targetDateStr: string,
  partySize: number
): Promise<TimeSlot[]> {
  if (!targetDateStr || partySize <= 0) return [];

  // Enforce dining limit of 5
  if (partySize > 5) {
    return [];
  }

  const [year, month, day] = targetDateStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  const weekday = targetDate.getDay();

  const [settings, hours, blocked, tables, allReservations] = await Promise.all([
    getRestaurantSettings(),
    getBusinessHours(),
    getBlockedDates(),
    getRestaurantTables(),
    getReservations(),
  ]);

  if (partySize > Math.min(settings.max_party_size || 5, 5)) {
    return [];
  }

  const isDateBlocked = blocked.some((b) => b.blocked_date === targetDateStr);
  if (isDateBlocked) {
    return [];
  }

  const dayHours = hours.find((h) => h.weekday === weekday);
  if (!dayHours || !dayHours.is_open) {
    return [];
  }

  const [openHour, openMin] = dayHours.start_time.split(':').map(Number);
  const [closeHour, closeMin] = dayHours.end_time.split(':').map(Number);

  const dayStartTime = new Date(year, month - 1, day, openHour, openMin, 0);
  const dayEndTime = new Date(year, month - 1, day, closeHour, closeMin, 0);

  if (dayEndTime <= dayStartTime) {
    dayEndTime.setDate(dayEndTime.getDate() + 1);
  }

  const cleanTargetDate = targetDateStr.slice(0, 10);
  const activeTables = tables
    .filter((t) => t.is_active)
    .sort((a, b) => a.table_name.localeCompare(b.table_name));

  if (activeTables.length === 0) {
    return [];
  }

  const dateReservations = allReservations.filter((res) => {
    if (!res.reservation_date || res.status === 'cancelled') return false;
    return res.reservation_date.slice(0, 10) === cleanTargetDate;
  });

  const parseReservationTime = (timeStr: string) => {
    if (!timeStr) return new Date(0);
    const match = timeStr.match(/(\d{1,2}):(\d{2})/);
    if (!match) return new Date(0);
    const h = parseInt(match[1], 10);
    const m = parseInt(match[2], 10);
    return new Date(year, month - 1, day, h, m, 0);
  };

  const parsedReservations = dateReservations.map((res) => ({
    table_id: res.table_id,
    party_size: Math.max(1, Number(res.party_size) || 1),
    start: parseReservationTime(res.start_time),
    end: parseReservationTime(res.end_time),
  }));

  const now = new Date();
  const noticeCutoff = new Date(now.getTime() + settings.booking_notice_hours * 60 * 60 * 1000);

  const durationMs = 90 * 60 * 1000; // 90 minutes dining duration
  const sessionIntervalMs = 90 * 60 * 1000; // 90 minutes between each seating in that room (cannot overlap)

  const availableSlots: TimeSlot[] = [];

  // Generate 90-minute staggered intervals per individual dining room
  activeTables.forEach((table, index) => {
    // 15-minute stagger between different dining rooms
    const staggerMinutes = (index % 4) * 15;
    let roomSessionStart = new Date(dayStartTime.getTime() + staggerMinutes * 60 * 1000);

    while (roomSessionStart.getTime() + durationMs <= dayEndTime.getTime()) {
      const roomSessionEnd = new Date(roomSessionStart.getTime() + durationMs);

      if (roomSessionStart >= noticeCutoff) {
        const totalCapacity = Math.min(table.capacity || 5, 5);

        // Find active reservations for this specific table during this 90-minute window
        const tableReservations = parsedReservations.filter((res) => {
          if (res.table_id !== table.id) return false;
          return roomSessionStart < res.end && roomSessionEnd > res.start;
        });

        // Compute booked seats on this table
        const bookedSeats = tableReservations.reduce((sum, res) => sum + res.party_size, 0);
        const remainingSeats = Math.max(0, totalCapacity - bookedSeats);
        const isTableFullyBooked = remainingSeats === 0;

        // Count concurrent active reservations in venue during this window
        const concurrentReservationsCount = parsedReservations.filter((res) => {
          return roomSessionStart < res.end && roomSessionEnd > res.start;
        }).length;

        const isVenueFull = concurrentReservationsCount >= 5;
        const cannotFitParty = partySize > remainingSeats;

        const startH = String(roomSessionStart.getHours()).padStart(2, '0');
        const startM = String(roomSessionStart.getMinutes()).padStart(2, '0');
        const endH = String(roomSessionEnd.getHours()).padStart(2, '0');
        const endM = String(roomSessionEnd.getMinutes()).padStart(2, '0');
        const label = `${startH}:${startM}`;
        const timeRange = `${startH}:${startM} - ${endH}:${endM} (90 min)`;

        availableSlots.push({
          start: new Date(roomSessionStart),
          end: new Date(roomSessionEnd),
          label,
          timeRange,
          tableId: table.id,
          tableName: table.table_name,
          tableArea: isTableFullyBooked
            ? `${table.area} · Fully Booked`
            : cannotFitParty
            ? `${table.area} · ${remainingSeats} ${remainingSeats === 1 ? 'seat' : 'seats'} left`
            : table.area,
          isLimitExceeded: isTableFullyBooked || isVenueFull || cannotFitParty,
          isBooked: isTableFullyBooked,
          totalCapacity,
          availableSeats: remainingSeats,
          activeReservationsCount: concurrentReservationsCount,
        });
      }

      // Next seating for this dining room is strictly 90 minutes later
      roomSessionStart = new Date(roomSessionStart.getTime() + sessionIntervalMs);
    }
  });

  // Sort slots chronologically
  availableSlots.sort((a, b) => a.start.getTime() - b.start.getTime());

  return availableSlots;
}

export async function checkIsAdmin(userId: string): Promise<boolean> {
  if (!userId) return false;
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (!error && data) {
        return true;
      }

      // Check if admin_users table is empty (first-time setup bootstrap)
      const { count, error: countErr } = await supabase
        .from('admin_users')
        .select('*', { count: 'exact', head: true });

      if (!countErr && (count === 0 || count === null)) {
        // Auto-bootstrap first authenticated user as admin
        try {
          await supabase.from('admin_users').insert({ user_id: userId });
        } catch {
          // ignore if RLS blocks, still allow initial setup
        }
        return true;
      }

      return false;
    } catch (e) {
      console.warn('Error checking admin_users table:', e);
      return false;
    }
  }

  return true;
}
