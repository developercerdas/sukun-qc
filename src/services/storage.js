import { BULAN_LIST, INITIAL_REFERENCES, INITIAL_SAMPLE_DATA } from '../constants';
import { getSupabaseClient } from './supabaseClient';

const LOCAL_STORAGE_KEY = 'sukun_qc_dataset_v1';
const REFS_STORAGE_KEY = 'sukun_qc_references_v1';
const LOGS_STORAGE_KEY = 'sukun_qc_logs_v1';

// Inisialisasi awal localStorage (murni kosong untuk pengujian)
export function initLocalStorage() {
  const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
  } else {
    try {
      const items = JSON.parse(raw);
      // Bersihkan data dummy lama bila ada agar database murni kosong
      const cleaned = Array.isArray(items) ? items.filter(it => !String(it.id).startsWith('sample-')) : [];
      if (cleaned.length !== items.length) {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleaned));
      }
    } catch {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([]));
    }
  }
  if (!localStorage.getItem(REFS_STORAGE_KEY)) {
    localStorage.setItem(REFS_STORAGE_KEY, JSON.stringify(INITIAL_REFERENCES));
  }
  if (!localStorage.getItem(LOGS_STORAGE_KEY)) {
    const initLog = [{
      id: Date.now(),
      timestamp: new Date().toISOString(),
      aksi: 'INIT',
      keterangan: 'Sistem Sukun QC siap digunakan (Database kosong untuk pengujian)'
    }];
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(initLog));
  }
}

// Log aktivitas helper
export async function logActivity(aksi, keterangan) {
  const newLog = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    aksi,
    keterangan
  };

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('log_aktivitas').insert([{
        aksi,
        keterangan,
        timestamp: newLog.timestamp
      }]);
    } catch (e) {
      console.warn('Gagal mencatat log ke Supabase:', e);
    }
  }

  // Simpan juga ke local log
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    const logs = raw ? JSON.parse(raw) : [];
    logs.unshift(newLog);
    if (logs.length > 200) logs.pop();
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Error logging to localStorage:', e);
  }
}

export async function getLogs() {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('log_aktivitas')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);
      if (!error && data) return data;
    } catch (e) {
      console.warn('Fallback ke log lokal:', e);
    }
  }

  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

// ==========================================
// REFERENSI (NAMA TELAK & LOKAL)
// ==========================================
export async function getReferences() {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('referensi').select('*');
      if (!error && data && data.length > 0) {
        const namaTelak = data.filter(d => d.kategori === 'NAMA_TELAK').map(d => d.nilai).sort();
        const lokal = data.filter(d => d.kategori === 'LOKAL').map(d => d.nilai).sort();
        return { namaTelak, lokal };
      }
    } catch (e) {
      console.warn('Fallback ke referensi lokal:', e);
    }
  }

  try {
    const raw = localStorage.getItem(REFS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_REFERENCES;
  } catch (e) {
    return INITIAL_REFERENCES;
  }
}

export async function addReference(kategori, nilai) {
  const val = String(nilai || '').trim();
  if (!val) return;

  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('referensi').insert([{ kategori, nilai: val }]);
    } catch (e) {
      console.warn('Gagal menambah referensi ke Supabase:', e);
    }
  }

  try {
    const refs = await getReferences();
    const key = kategori === 'NAMA_TELAK' ? 'namaTelak' : 'lokal';
    if (!refs[key].includes(val)) {
      refs[key].push(val);
      refs[key].sort();
      localStorage.setItem(REFS_STORAGE_KEY, JSON.stringify(refs));
    }
  } catch (e) {
    console.error('Error saving reference locally:', e);
  }
}

export async function deleteReference(kategori, nilai) {
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('referensi').delete().eq('kategori', kategori).eq('nilai', nilai);
    } catch (e) {
      console.warn('Gagal menghapus referensi di Supabase:', e);
    }
  }

  try {
    const refs = await getReferences();
    const key = kategori === 'NAMA_TELAK' ? 'namaTelak' : 'lokal';
    refs[key] = refs[key].filter(item => item !== nilai);
    localStorage.setItem(REFS_STORAGE_KEY, JSON.stringify(refs));
  } catch (e) {
    console.error('Error deleting reference locally:', e);
  }
}

// ==========================================
// CRUD DATA PRODUKSI
// ==========================================
export async function getProduksi() {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client
        .from('produksi')
        .select('*')
        .order('TANGGAL', { ascending: false })
        .order('id', { ascending: false });

      if (!error && data) {
        return data;
      }
      console.warn('Supabase fetch error, fallback ke local:', error?.message);
    } catch (e) {
      console.warn('Supabase offline / error:', e);
    }
  }

  try {
    initLocalStorage();
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const items = raw ? JSON.parse(raw) : [];
    return items.sort((a, b) => {
      const ta = String(a.TANGGAL || '');
      const tb = String(b.TANGGAL || '');
      if (ta !== tb) return tb.localeCompare(ta);
      return String(b.id).localeCompare(String(a.id));
    });
  } catch (e) {
    console.error('Error loading local dataset:', e);
    return [];
  }
}

export async function addProduksi(form) {
  const tglStr = form.TANGGAL;
  if (!tglStr) throw new Error('Tanggal wajib diisi.');

  const [yearStr, monthStr] = tglStr.split('-');
  const year = parseInt(yearStr, 10);
  const monthNum = parseInt(monthStr, 10);
  const monthName = BULAN_LIST[monthNum - 1] || '';

  const num = v => {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };

  const record = {
    YEAR: year,
    MONTH: monthName,
    MONTH_NUMBER: monthNum,
    TANGGAL: tglStr,
    HARI: form.HARI || '',
    JAM_WIB: form.JAM_WIB || form.JAM || '',
    NAMA: String(form.NAMA || '').trim(),
    LOKAL: String(form.LOKAL || '').trim(),
    ABSENSI: form.ABSENSI || 'Hadir',
    GARAPAN: num(form.GARAPAN),
    CW: num(form.CW),
    PK: num(form.PK),
    LK: num(form.LK),
    TK: num(form.TK),
    MT: num(form.MT),
    MD: num(form.MD),
    AT: num(form.AT),
    MM: num(form.MM),
    KERUSAKAN_TELAK: num(form.KERUSAKAN_TELAK),
    KERUSAKAN_MANDOR: num(form.KERUSAKAN_MANDOR),
    KEKURANGAN_PAPIR: num(form.KEKURANGAN_PAPIR),
    created_at: new Date().toISOString()
  };

  if (!record.NAMA) throw new Error('Nama Telak wajib diisi.');
  if (!record.LOKAL) throw new Error('Lokal wajib diisi.');

  // Pastikan referensi Nama & Lokal baru tersimpan otomatis
  await addReference('NAMA_TELAK', record.NAMA);
  await addReference('LOKAL', record.LOKAL);

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('produksi').insert([record]).select();
      if (error) throw error;
      await logActivity('TAMBAH', `Menambahkan data: ${record.NAMA} - ${record.TANGGAL} (Supabase)`);
      return { success: true, data: data[0] };
    } catch (e) {
      console.warn('Gagal simpan ke Supabase, simpan ke lokal:', e);
    }
  }

  // Simpan Lokal
  record.id = 'loc-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
  const items = await getProduksi();
  items.unshift(record);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  await logActivity('TAMBAH', `Menambahkan data: ${record.NAMA} - ${record.TANGGAL} (Lokal)`);
  return { success: true, data: record };
}

export async function updateProduksi(id, form) {
  const tglStr = form.TANGGAL;
  const [yearStr, monthStr] = tglStr.split('-');
  const year = parseInt(yearStr, 10);
  const monthNum = parseInt(monthStr, 10);
  const monthName = BULAN_LIST[monthNum - 1] || '';

  const num = v => {
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };

  const updatedFields = {
    YEAR: year,
    MONTH: monthName,
    MONTH_NUMBER: monthNum,
    TANGGAL: tglStr,
    HARI: form.HARI || '',
    JAM_WIB: form.JAM_WIB || form.JAM || '',
    NAMA: String(form.NAMA || '').trim(),
    LOKAL: String(form.LOKAL || '').trim(),
    ABSENSI: form.ABSENSI || 'Hadir',
    GARAPAN: num(form.GARAPAN),
    CW: num(form.CW),
    PK: num(form.PK),
    LK: num(form.LK),
    TK: num(form.TK),
    MT: num(form.MT),
    MD: num(form.MD),
    AT: num(form.AT),
    MM: num(form.MM),
    KERUSAKAN_TELAK: num(form.KERUSAKAN_TELAK),
    KERUSAKAN_MANDOR: num(form.KERUSAKAN_MANDOR),
    KEKURANGAN_PAPIR: num(form.KEKURANGAN_PAPIR)
  };

  const client = getSupabaseClient();
  if (client) {
    try {
      const { data, error } = await client.from('produksi').update(updatedFields).eq('id', id).select();
      if (!error) {
        await logActivity('UPDATE', `Memperbarui data ID ${id}: ${updatedFields.NAMA} (Supabase)`);
        return { success: true, data: data[0] };
      }
    } catch (e) {
      console.warn('Gagal update di Supabase:', e);
    }
  }

  // Update Lokal
  const items = await getProduksi();
  const idx = items.findIndex(item => String(item.id) === String(id));
  if (idx !== -1) {
    items[idx] = { ...items[idx], ...updatedFields };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    await logActivity('UPDATE', `Memperbarui data ID ${id}: ${updatedFields.NAMA} (Lokal)`);
    return { success: true, data: items[idx] };
  }
  throw new Error('Data tidak ditemukan');
}

export async function deleteProduksi(id) {
  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client.from('produksi').delete().eq('id', id);
      if (!error) {
        await logActivity('HAPUS', `Menghapus data ID: ${id} (Supabase)`);
        return { success: true };
      }
    } catch (e) {
      console.warn('Gagal hapus di Supabase:', e);
    }
  }

  // Hapus Lokal
  const items = await getProduksi();
  const filtered = items.filter(item => String(item.id) !== String(id));
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  await logActivity('HAPUS', `Menghapus data ID: ${id} (Lokal)`);
  return { success: true };
}

// Audit data anomali / duplikat
export function auditDataset(dataset) {
  const issues = [];
  const seen = {};

  dataset.forEach((item, index) => {
    const rowNum = index + 1;
    if (!item.NAMA) {
      issues.push({ row: rowNum, id: item.id, kolom: "NAMA TELAK", masalah: "Nama Telak Kosong", saran: "Isi nama operator telak", severity: "high" });
    }
    if (!item.LOKAL) {
      issues.push({ row: rowNum, id: item.id, kolom: "LOKAL", masalah: "Lokal Kosong", saran: "Tentukan lokasi lokal", severity: "high" });
    }
    if (!item.TANGGAL) {
      issues.push({ row: rowNum, id: item.id, kolom: "TANGGAL", masalah: "Tanggal Kosong", saran: "Isi tanggal produksi", severity: "high" });
    }
    const garapan = Number(item.GARAPAN || 0);
    if (garapan <= 0) {
      issues.push({ row: rowNum, id: item.id, kolom: "GARAPAN", masalah: "Garapan 0 / Kosong", saran: "Periksa jumlah batang rokok garapan", severity: "medium" });
    }
    const telak = Number(item.KERUSAKAN_TELAK || 0);
    if (garapan > 0 && telak > garapan) {
      issues.push({ row: rowNum, id: item.id, kolom: "KERUSAKAN TELAK", masalah: "Kerusakan melebihi Garapan", saran: "Cek input: kerusakan tidak boleh lebih besar dari total garapan", severity: "high" });
    }

    // Cek Duplikat
    const key = `${item.TANGGAL}|${item.NAMA}|${item.LOKAL}`;
    if (item.TANGGAL && item.NAMA && item.LOKAL) {
      if (seen[key]) {
        issues.push({
          row: rowNum,
          id: item.id,
          kolom: "DUPLIKAT",
          masalah: `Duplikat dengan baris #${seen[key].row} (${item.NAMA} - ${item.TANGGAL})`,
          saran: "Hapus salah satu data yang ganda",
          severity: "high"
        });
      } else {
        seen[key] = { row: rowNum, id: item.id };
      }
    }
  });

  return {
    totalChecked: dataset.length,
    issuesCount: issues.length,
    issues
  };
}

// Backup & Restore
export async function backupAll() {
  const data = await getProduksi();
  const refs = await getReferences();
  const logs = await getLogs();
  return {
    app: "Sukun Quality Control",
    version: "2.5",
    exported_at: new Date().toISOString(),
    dataset: data,
    references: refs,
    logs
  };
}

export async function restoreAll(jsonObj) {
  if (!jsonObj || !Array.isArray(jsonObj.dataset)) {
    throw new Error("Format file cadangan (backup) tidak valid.");
  }
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(jsonObj.dataset));
  if (jsonObj.references) {
    localStorage.setItem(REFS_STORAGE_KEY, JSON.stringify(jsonObj.references));
  }
  if (jsonObj.logs) {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(jsonObj.logs));
  }
  await logActivity('RESTORE', `Memulihkan cadangan data (${jsonObj.dataset.length} baris)`);
  return true;
}
