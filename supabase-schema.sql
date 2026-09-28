-- ====================================================
-- AURELIA / DINEFLOW RESTAURANT RESERVATION SYSTEM - SUPABASE SCHEMA
-- ====================================================
-- Run this script in your Supabase SQL Editor.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. RESTAURANT TABLES
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  capacity INT NOT NULL CHECK (capacity > 0),
  area TEXT NOT NULL DEFAULT 'Main Dining Room',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. MENU ITEMS
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  category TEXT NOT NULL,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. BUSINESS HOURS (0=Sunday, 1=Monday ... 6=Saturday)
CREATE TABLE IF NOT EXISTS business_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  weekday INT NOT NULL UNIQUE CHECK (weekday >= 0 AND weekday <= 6),
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL
);

-- 4. BLOCKED DATES
CREATE TABLE IF NOT EXISTS blocked_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocked_date DATE NOT NULL UNIQUE,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. RESTAURANT SETTINGS
CREATE TABLE IF NOT EXISTS restaurant_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_name TEXT NOT NULL DEFAULT 'Aurelia Table & Cellar',
  restaurant_email TEXT NOT NULL DEFAULT 'concierge@aurelia-dining.com',
  restaurant_phone TEXT NOT NULL DEFAULT '+1 (415) 890-4200',
  restaurant_address TEXT NOT NULL DEFAULT '742 Montgomery Street, Jackson Square, San Francisco, CA 94111',
  slot_interval_minutes INT NOT NULL DEFAULT 30,
  booking_notice_hours INT NOT NULL DEFAULT 2,
  default_reservation_duration_minutes INT NOT NULL DEFAULT 90,
  max_party_size INT NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ADMIN USERS (matches auth.users.id)
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. RESERVATIONS
CREATE TABLE IF NOT EXISTS reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  party_size INT NOT NULL CHECK (party_size > 0),
  table_id UUID NOT NULL REFERENCES restaurant_tables(id) ON DELETE RESTRICT,
  reservation_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  special_requests TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE POLICY "Public read active tables" ON restaurant_tables FOR SELECT USING (true);
CREATE POLICY "Admin write tables" ON restaurant_tables FOR ALL USING (is_admin());

CREATE POLICY "Public read active menu" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Admin write menu" ON menu_items FOR ALL USING (is_admin());

CREATE POLICY "Public read business hours" ON business_hours FOR SELECT USING (true);
CREATE POLICY "Admin write business hours" ON business_hours FOR ALL USING (is_admin());

CREATE POLICY "Public read blocked dates" ON blocked_dates FOR SELECT USING (true);
CREATE POLICY "Admin write blocked dates" ON blocked_dates FOR ALL USING (is_admin());

CREATE POLICY "Public read restaurant settings" ON restaurant_settings FOR SELECT USING (true);
CREATE POLICY "Admin write restaurant settings" ON restaurant_settings FOR ALL USING (is_admin());

CREATE POLICY "Admin read admin_users" ON admin_users FOR SELECT USING (true);
CREATE POLICY "Admin write admin_users" ON admin_users FOR ALL USING (is_admin());

CREATE POLICY "Public create reservation" ON reservations FOR INSERT WITH CHECK (true);
CREATE POLICY "Public read reservations" ON reservations FOR SELECT USING (true);
CREATE POLICY "Admin manage reservations" ON reservations FOR ALL USING (is_admin());

-- Seed Data
INSERT INTO restaurant_settings (
  restaurant_name,
  restaurant_email,
  restaurant_phone,
  restaurant_address,
  slot_interval_minutes,
  booking_notice_hours,
  default_reservation_duration_minutes,
  max_party_size
) VALUES (
  'Aurelia Table & Cellar',
  'concierge@aurelia-dining.com',
  '+1 (415) 890-4200',
  '742 Montgomery Street, Jackson Square, San Francisco, CA 94111',
  30,
  2,
  90,
  10
) ON CONFLICT DO NOTHING;

INSERT INTO business_hours (weekday, is_open, start_time, end_time) VALUES
  (0, TRUE, '17:00', '22:30'),
  (1, FALSE, '17:00', '22:00'),
  (2, TRUE, '17:00', '22:30'),
  (3, TRUE, '17:00', '22:30'),
  (4, TRUE, '17:00', '23:00'),
  (5, TRUE, '16:30', '23:30'),
  (6, TRUE, '16:30', '23:30')
ON CONFLICT (weekday) DO UPDATE SET 
  is_open = EXCLUDED.is_open,
  start_time = EXCLUDED.start_time,
  end_time = EXCLUDED.end_time;

INSERT INTO restaurant_tables (table_name, capacity, area, is_active) VALUES
  ('Table 01 · Hearthside Booth', 4, 'Hearth Room', true),
  ('Table 02 · Hearthside Booth', 4, 'Hearth Room', true),
  ('Table 03 · Chef''s Counter A', 2, 'Chef''s Counter', true),
  ('Table 04 · Chef''s Counter B', 2, 'Chef''s Counter', true),
  ('Table 05 · Window Promenade', 2, 'Main Dining Room', true),
  ('Table 06 · Window Promenade', 2, 'Main Dining Room', true),
  ('Table 07 · Grand Round', 6, 'Main Dining Room', true),
  ('Table 08 · Grand Round', 8, 'Main Dining Room', true),
  ('Table 09 · Garden Veranda', 4, 'Terrace Veranda', true),
  ('Table 10 · Garden Veranda', 4, 'Terrace Veranda', true),
  ('Table 11 · Sommelier Cellar Vault', 10, 'Private Cellar', true)
ON CONFLICT DO NOTHING;

INSERT INTO menu_items (name, description, price, category, is_featured, is_active) VALUES
  ('Wood-Fired Hokkaido Scallops', 'Hand-dived scallops, preserved Meyer lemon beurre blanc, sturgeon caviar, sea fennel.', 34.00, 'Starters', true, true),
  ('Dry-Aged Wagyu Tartare', 'Kobe A5 striploin, charred bone marrow emulsion, pickled chanterelles, grilled brioche crisps.', 32.00, 'Starters', true, true),
  ('Burrata Pugliese & Charred Figs', 'Wood-roasted mission figs, 25-year aged balsamic of Modena, pistachio praline, micro basil.', 26.00, 'Starters', false, true),
  ('Oak-Smoked Sonoma Duck Breast', 'Spiced sour cherry reduction, caramelized sunchoke purée, braised endive, duck crackling.', 58.00, 'Mains', true, true),
  ('Prime Dry-Aged Ribeye (16oz)', '45-day dry-aged, hearth ember roasted, wild foraged black trumpet butter, smoked sea salt.', 76.00, 'Mains', true, true),
  ('Handmade Campanelle & Black Truffle', 'Fresh extruded pasta, cultured Normandy butter, 36-month Parmigiano-Reggiano, shaved Périgord truffle.', 48.00, 'Mains', true, true),
  ('Wild Pacific King Salmon', 'Crispy skin, fermented ramp dashi, baby leeks, golden chanterelles, garden herb oil.', 52.00, 'Mains', false, true),
  ('Smoked Valrhona Chocolate Crémeux', '70% Guanaja chocolate, salted caramel crunch, rosemary gelato, 24k gold leaf.', 22.00, 'Desserts', true, true),
  ('Wood-Roasted Caramelized Fig Tart', 'Tahitian vanilla bean crème diplomate, honeycomb crisp, roasted pistachio gelato.', 20.00, 'Desserts', true, true),
  ('Smoked Rosemary Old Fashioned', 'WhistlePig 10yr Rye, charred rosemary syrup, angostura & orange bitters, torched peel.', 24.00, 'Beverages', true, true)
ON CONFLICT DO NOTHING;
