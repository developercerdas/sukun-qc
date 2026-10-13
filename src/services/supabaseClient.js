import { createClient } from '@supabase/supabase-js';

const CONFIG_KEY = 'sukun_qc_supabase_config';

export function normalizeSupabaseUrl(rawUrl) {
  if (!rawUrl) return '';
  let url = String(rawUrl).trim();
  url = url.replace(/\/rest\/v1\/?$/, '');
  url = url.replace(/\/+$/, '');
  return url;
}

// Kredensial Resmi Supabase Cloud PT. SUKUN WARTONO INDONESIA
export const DEFAULT_SUPABASE_URL = 'https://qjdcbqjnfmidhxczyzhm.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_rZ63bjpA-Xvuxu18DKi6fw_-Nxqi_Ya';

export function getSupabaseConfig() {
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return {
          url: normalizeSupabaseUrl(parsed.url),
          anonKey: String(parsed.anonKey).trim()
        };
      }
    }
  } catch (e) {
    console.error('Failed to parse Supabase config from localStorage', e);
  }
  return {
    url: normalizeSupabaseUrl(import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL),
    anonKey: String(import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY).trim()
  };
}

export function saveSupabaseConfig(url, anonKey) {
  const cleanUrl = normalizeSupabaseUrl(url);
  const cleanKey = String(anonKey || '').trim();
  const cfg = { url: cleanUrl, anonKey: cleanKey };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
  cachedClient = null; // Clear client cache agar koneksi baru di-load
  return cfg;
}

let cachedClient = null;
let lastUrl = '';
let lastKey = '';

export function getSupabaseClient() {
  const cfg = getSupabaseConfig();
  if (!cfg.url || !cfg.anonKey) return null;

  if (cachedClient && lastUrl === cfg.url && lastKey === cfg.anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(cfg.url, cfg.anonKey);
    lastUrl = cfg.url;
    lastKey = cfg.anonKey;
    return cachedClient;
  } catch (err) {
    console.error('Error creating Supabase client:', err);
    return null;
  }
}

export async function testSupabaseConnection(url, anonKey) {
  try {
    const cleanUrl = normalizeSupabaseUrl(url);
    const cleanKey = String(anonKey || '').trim();
    const client = createClient(cleanUrl, cleanKey);
    const { data, error } = await client.from('produksi').select('id').limit(1);
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Koneksi ke Supabase Cloud berhasil! Database siap digunakan.' };
  } catch (err) {
    return { success: false, message: err.message };
  }
}
