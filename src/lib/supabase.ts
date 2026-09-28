import { createClient, SupabaseClient } from '@supabase/supabase-js';

const getEnvOrStored = (envKey: string, storageKey: string): string => {
  const envVal = import.meta.env[envKey];
  if (envVal && !envVal.includes('PASTE_YOUR_') && envVal.trim() !== '') {
    return envVal.trim();
  }
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(storageKey);
    if (stored && stored.trim() !== '') {
      return stored.trim();
    }
  }
  return '';
};

const rawUrl = getEnvOrStored('VITE_SUPABASE_URL', 'aurelia_supabase_url');
const rawKey = getEnvOrStored('VITE_SUPABASE_ANON_KEY', 'aurelia_supabase_anon_key');

const isValidUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isSupabaseConfigured = Boolean(
  rawUrl &&
  rawKey &&
  isValidUrl(rawUrl) &&
  !rawUrl.includes('PASTE_YOUR_') &&
  !rawKey.includes('PASTE_YOUR_')
);

// Fallback URL to prevent createClient from crashing if env vars are still placeholders
const safeUrl = isSupabaseConfigured ? rawUrl : 'https://aurelia-restaurant-demo.supabase.co';
const safeKey = isSupabaseConfigured ? rawKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy';

export const supabase: SupabaseClient = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export const setCustomSupabaseCredentials = (url: string, key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('aurelia_supabase_url', url.trim());
    localStorage.setItem('aurelia_supabase_anon_key', key.trim());
    window.location.reload();
  }
};

export const clearCustomSupabaseCredentials = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('aurelia_supabase_url');
    localStorage.removeItem('aurelia_supabase_anon_key');
    window.location.reload();
  }
};
