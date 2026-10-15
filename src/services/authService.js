// ===================================================================
// LAYANAN AUTENTIKASI, MASTER ROLE & MASTER RULE - PT. SUKUN WARTONO INDONESIA
// ===================================================================
import { getSupabaseClient } from './supabaseClient';

export const DEFAULT_USERS = [
  {
    id: 'usr-admin',
    username: 'admin',
    password: 'sukun123',
    name: 'Administrator QC',
    role: 'admin',
    roleLabel: 'Super Admin',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    avatar: 'AD',
    assignedLokal: 'ALL',
    deskripsi: 'Akses penuh: Seluruh lokal pabrik, Dashboard, Tally, Excel, Kartu Giling, Laporan, Audit & Pengaturan'
  },
  {
    id: 'usr-mandor-1',
    username: 'mandor1',
    password: 'sukun123',
    name: 'Mandor Sutrisno',
    role: 'mandor',
    roleLabel: 'Mandor QC',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    avatar: 'M1',
    assignedLokal: 'Lokal 1',
    deskripsi: 'Mandor Meja QC Lokal 1: Khusus mengawasi dan mengelola data produksi di Lokal 1'
  },
  {
    id: 'usr-mandor-2',
    username: 'mandor2',
    password: 'sukun123',
    name: 'Mandor Supardi',
    role: 'mandor',
    roleLabel: 'Mandor QC',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    avatar: 'M2',
    assignedLokal: 'L1C',
    deskripsi: 'Mandor Meja QC L1C: Khusus mengawasi dan mengelola data produksi di L1C'
  },
  {
    id: 'usr-mandor-3',
    username: 'mandor3',
    password: 'sukun123',
    name: 'Mandor Haryanto',
    role: 'mandor',
    roleLabel: 'Mandor QC',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    avatar: 'M3',
    assignedLokal: 'L3B',
    deskripsi: 'Mandor Meja QC L3B: Khusus mengawasi dan mengelola data produksi di L3B'
  },
  {
    id: 'usr-operator',
    username: 'operator',
    password: 'sukun123',
    name: 'Operator Inspeksi Mutu',
    role: 'operator',
    roleLabel: 'Operator Mutu',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    avatar: 'OP',
    assignedLokal: 'ALL',
    deskripsi: 'Akses pemantauan: Melihat Dashboard KPI, Rasio Cacat Harian & Anatomi 8 Cacat Rokok'
  }
];

// Master Rule: Matriks Hak Akses Modul per Role
export const ROLE_PERMISSIONS = {
  admin: {
    label: 'Super Admin',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    description: 'Hak akses tanpa batas: input, kelola data, cetak kartu, laporan, audit integritas, kelola user & pengaturan database.',
    allowedTabs: [
      'dashboard',
      'input',
      'import',
      'produksi',
      'anatomi',
      'analisis',
      'laporan',
      'audit',
      'pengaturan'
    ],
    canEdit: true,
    canDelete: true,
    canManageUsers: true,
    canExport: true,
    canConfigureDb: true
  },
  mandor: {
    label: 'Mandor QC Lantai',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    description: 'Hak akses operasional lapangan: input tally QC meja, import excel, kelola data produksi, cetak kartu giling, dan laporan resmi.',
    allowedTabs: [
      'dashboard',
      'input',
      'import',
      'produksi',
      'anatomi',
      'analisis',
      'laporan'
    ],
    canEdit: true,
    canDelete: false,
    canManageUsers: false,
    canExport: true,
    canConfigureDb: false
  },
  operator: {
    label: 'Operator / Viewer',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    description: 'Hak akses pantau: melihat dashboard kinerja pabrik, status AQL harian, dan panduan mitigasi anatomi 8 cacat rokok.',
    allowedTabs: [
      'dashboard',
      'anatomi'
    ],
    canEdit: false,
    canDelete: false,
    canManageUsers: false,
    canExport: false,
    canConfigureDb: false
  }
};

// Master Rule: Standar Baku Mutu QC PT. SUKUN WARTONO INDONESIA
export const MASTER_QC_RULES = [
  {
    id: 'aql-grade-a',
    kategori: 'STANDAR AQL (ACCEPTABLE QUALITY LIMIT)',
    nama: 'Grade A - Kualitas Optimal (LULUS)',
    toleransi: '≤ 0.80%',
    statusBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    keterangan: 'Rasio cacat total di bawah 0.80% dari total garapan batang rokok. Produksi memenuhi standar mutu prima.'
  },
  {
    id: 'aql-grade-b',
    kategori: 'STANDAR AQL (ACCEPTABLE QUALITY LIMIT)',
    nama: 'Grade B - Batas Toleransi (WASPADA)',
    toleransi: '0.81% - 1.20%',
    statusBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    keterangan: 'Rasio cacat mendekati batas ambang. Mandor QC wajib melakukan pemantauan intensif di meja gilingan terkait.'
  },
  {
    id: 'aql-grade-c',
    kategori: 'STANDAR AQL (ACCEPTABLE QUALITY LIMIT)',
    nama: 'Grade C - Di Luar Batas (KRITIS)',
    toleransi: '> 1.20%',
    statusBadge: 'bg-red-500/20 text-red-300 border-red-500/30',
    keterangan: 'Tingkat kerusakan tinggi. Wajib kalibrasi mesin/alat giling dan pembinaan teknik terhadap operator bersangkutan.'
  },
  {
    id: 'cost-defect',
    kategori: 'PARAMETER FINANSIAL & MATERIAL',
    nama: 'Estimasi Biaya Rugi Cacat Fisik',
    toleransi: 'Rp 150 / batang',
    statusBadge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    keterangan: 'Kerugian material tembakau, saus, papir, dan lem per batang rokok yang dinyatakan rusak telak.'
  },
  {
    id: 'inspection-defects',
    kategori: 'SPESIFIKASI 8 TITIK CACAT FISIK',
    nama: 'Defect Types Resmi PT. Sukun',
    toleransi: '8 Kategori Baku',
    statusBadge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    keterangan: 'CW (Cowong), PK (Papir Kusut), LK (Lem Kurang), TK (Talipan Kotor), MT (Muntir), MD (Medot), AT (Atos), MM (Mekar Mingkup).'
  },
  {
    id: 'time-tracking',
    kategori: 'ATURAN WAKTU & OPERASIONAL',
    nama: 'Pencatatan Presisi Real-Time',
    toleransi: 'Hari, Tanggal & Jam WIB',
    statusBadge: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    keterangan: 'Setiap pencatatan inspeksi wajib merekam Hari (Senin-Minggu), Tanggal Masehi, dan Jam WIB saat inspeksi berlangsung.'
  }
];

const AUTH_STORAGE_KEY = 'sukun_qc_auth_session';
const USERS_STORAGE_KEY = 'sukun_qc_users_list_v2';

// Ambil daftar pengguna (dengan fallback default)
export function getAllUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed reading users from localStorage', e);
  }
  return DEFAULT_USERS;
}

// Simpan daftar pengguna ke localStorage
export function saveAllUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// Sinkronisasi akun mandor dengan Supabase cloud (tabel referensi)
export async function syncUsersWithSupabase() {
  const client = getSupabaseClient();
  if (!client) return getAllUsers();

  try {
    const { data, error } = await client
      .from('referensi')
      .select('*')
      .eq('kategori', 'USER_ACCOUNT');

    if (!error && data && data.length > 0) {
      const cloudUsers = data.map(d => {
        try {
          return JSON.parse(d.nilai);
        } catch (_) {
          return null;
        }
      }).filter(Boolean);

      const current = getAllUsers();
      const map = new Map();
      DEFAULT_USERS.forEach(u => map.set(u.username, u));
      current.forEach(u => map.set(u.username, u));
      cloudUsers.forEach(u => map.set(u.username, u));

      const merged = Array.from(map.values());
      saveAllUsers(merged);
      return merged;
    }
  } catch (e) {
    console.warn('Sync users warning:', e);
  }
  return getAllUsers();
}

// Tambah user baru (hanya Super Admin)
export async function addUser(newUserData) {
  const users = getAllUsers();
  const cleanUsername = String(newUserData.username || '').trim().toLowerCase();

  if (!cleanUsername) throw new Error('Username wajib diisi.');
  if (!newUserData.password) throw new Error('Password wajib diisi.');
  if (users.some((u) => u.username.toLowerCase() === cleanUsername)) {
    throw new Error(`Username "${cleanUsername}" sudah digunakan!`);
  }

  const role = newUserData.role || 'mandor';
  const roleMeta = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.mandor;
  const assignedLokal = newUserData.assignedLokal || 'Lokal 1';

  const newUser = {
    id: 'usr-' + Date.now(),
    username: cleanUsername,
    password: newUserData.password,
    name: newUserData.name || cleanUsername,
    role: role,
    roleLabel: roleMeta.label,
    badgeColor: roleMeta.badge,
    avatar: (newUserData.name || cleanUsername).substring(0, 2).toUpperCase(),
    assignedLokal: assignedLokal,
    deskripsi: role === 'mandor' ? `Mandor Pengawas Wilayah: ${assignedLokal}` : roleMeta.description
  };

  users.push(newUser);
  saveAllUsers(users);

  // Sync ke Supabase cloud jika terhubung
  const client = getSupabaseClient();
  if (client) {
    try {
      await client.from('referensi').insert([{
        kategori: 'USER_ACCOUNT',
        nilai: JSON.stringify(newUser)
      }]);
    } catch (e) {
      console.warn('Gagal sync user ke Supabase:', e);
    }
  }

  return newUser;
}

// Update user (hanya Super Admin)
export function updateUser(id, updateData) {
  const users = getAllUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error('User tidak ditemukan.');

  const role = updateData.role || users[idx].role;
  const roleMeta = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.mandor;
  const assignedLokal = updateData.assignedLokal || users[idx].assignedLokal || 'Lokal 1';

  users[idx] = {
    ...users[idx],
    name: updateData.name || users[idx].name,
    role: role,
    roleLabel: roleMeta.label,
    badgeColor: roleMeta.badge,
    assignedLokal: assignedLokal,
    deskripsi: role === 'mandor' ? `Mandor Pengawas Wilayah: ${assignedLokal}` : roleMeta.description,
    password: updateData.password || users[idx].password
  };

  saveAllUsers(users);
  return users[idx];
}

// Hapus user (hanya Super Admin)
export async function deleteUser(id) {
  const users = getAllUsers();
  if (id === 'usr-admin') {
    throw new Error('Akun Super Admin utama tidak boleh dihapus!');
  }
  const toDelete = users.find((u) => u.id === id);
  const filtered = users.filter((u) => u.id !== id);
  saveAllUsers(filtered);

  // Hapus juga dari Supabase cloud jika ada
  const client = getSupabaseClient();
  if (client && toDelete) {
    try {
      const { data } = await client.from('referensi').select('id, nilai').eq('kategori', 'USER_ACCOUNT');
      if (data) {
        for (const item of data) {
          try {
            const p = JSON.parse(item.nilai);
            if (p.id === id || p.username === toDelete.username) {
              await client.from('referensi').delete().eq('id', item.id);
            }
          } catch (_) {}
        }
      }
    } catch (_) {}
  }
}

// Cek sesi login saat ini
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading user session', e);
  }
  return null;
}

// Proses login
export function loginUser(username, password) {
  const cleanU = String(username || '').trim().toLowerCase();
  const cleanP = String(password || '').trim();

  const users = getAllUsers();
  const found = users.find(
    (u) => u.username.toLowerCase() === cleanU && u.password === cleanP
  );

  if (!found) {
    throw new Error('Username atau kata sandi tidak valid. Silakan periksa kembali.');
  }

  const session = {
    id: found.id,
    username: found.username,
    name: found.name,
    role: found.role,
    roleLabel: found.roleLabel,
    badgeColor: found.badgeColor,
    avatar: found.avatar,
    assignedLokal: found.assignedLokal || 'ALL',
    loginAt: new Date().toISOString()
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  return session;
}

// Proses logout
export function logoutUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}

// Cek izin akses modul
export function canAccessTab(userRole, tabId) {
  const roleCfg = ROLE_PERMISSIONS[userRole];
  if (!roleCfg) return false;
  return roleCfg.allowedTabs.includes(tabId);
}
