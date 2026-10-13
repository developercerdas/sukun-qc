import { createClient } from '@supabase/supabase-js';

const CONFIG_KEY = 'sukun_qc_supabase_config';

export function getSupabaseConfig() {
  try {
    const saved = localStorage.getItem(CONFIG_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse Supabase config from localStorage', e);
  }
  return {
    url: import.meta.env.VITE_SUPABASE_URL || '',
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ''
  };
}

export function saveSupabaseConfig(url, anonKey) {
  const cfg = { url: url.trim(), anonKey: anonKey.trim() };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg));
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
    const client = createClient(url, anonKey);
    const { data, error } = await client.from('produksi').select('id').limit(1);
    if (error) {
      return { success: false, message: error.message };
    }
    return { success: true, message: 'Koneksi ke Supabase berhasil!' };
  } catch (err) {
    return { success: false, message: err.message };
  }
}
