export interface RestaurantTable {
  id: string;
  table_name: string;
  capacity: number;
  area: string;
  is_active: boolean;
  created_at?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  is_featured: boolean;
  is_active: boolean;
  created_at?: string;
}

export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Reservation {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  party_size: number;
  table_id: string;
  reservation_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM or HH:MM:SS
  end_time: string; // HH:MM or HH:MM:SS
  status: ReservationStatus;
  special_requests: string | null;
  created_at?: string;
  // Join helper
  restaurant_tables?: RestaurantTable;
}

export interface BusinessHour {
  id: string;
  weekday: number; // 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday
  is_open: boolean;
  start_time: string; // HH:MM
  end_time: string; // HH:MM
}

export interface BlockedDate {
  id: string;
  blocked_date: string; // YYYY-MM-DD
  reason: string;
  created_at?: string;
}

export interface RestaurantSettings {
  id: string;
  restaurant_name: string;
  restaurant_email: string;
  restaurant_phone: string;
  restaurant_address: string;
  slot_interval_minutes: number;
  booking_notice_hours: number;
  default_reservation_duration_minutes: number;
  max_party_size: number;
  created_at?: string;
}

export interface AdminUser {
  id: string;
  user_id: string;
  created_at?: string;
}

export interface TimeSlot {
  start: Date;
  end: Date;
  label: string; // "18:00"
  tableId: string;
  tableName?: string;
  tableArea?: string;
}
