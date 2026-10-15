import React, { useState, useEffect } from 'react';
import {
  Database,
  Check,
  Copy,
  RefreshCw,
  Plus,
  HardDrive,
  Download,
  Upload,
  History,
  GitBranch,
  ShieldCheck,
  Users,
  Key,
  Trash2,
  UserPlus,
  Sliders,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection
} from '../services/supabaseClient';
import { backupAll, restoreAll, clearAllProduksi } from '../services/storage';
import {
  getAllUsers,
  addUser,
  deleteUser,
  ROLE_PERMISSIONS,
  MASTER_QC_RULES
} from '../services/authService';
import { soundFx } from '../utils/soundHelper';

export default function PengaturanView({
  references,
  onAddReference,
  onDeleteReference,
  logs,
  onRefreshData
}) {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [newNama, setNewNama] = useState('');
  const [newLokal, setNewLokal] = useState('');

  // Master Users State
  const [usersList, setUsersList] = useState(() => getAllUsers());
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    password: '',
    name: '',
    role: 'mandor',
    assignedLokal: 'Lokal 1'
  });
  const [userActionMsg, setUserActionMsg] = useState('');

  useEffect(() => {
    const cfg = getSupabaseConfig();
    setSupabaseUrl(cfg.url || '');
    setSupabaseKey(cfg.anonKey || '');
  }, []);

  const handleTestConnection = async () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      alert('Silakan isi Supabase URL dan Anon Key terlebih dahulu.');
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection(supabaseUrl, supabaseKey);
      setTestResult(res);
      if (res.success) {
        saveSupabaseConfig(supabaseUrl, supabaseKey);
        await onRefreshData();
      }
    } catch (err) {
      setTestResult({ success: false, message: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = () => {
    saveSupabaseConfig(supabaseUrl, supabaseKey);
    alert('Konfigurasi database berhasil disimpan.');
    onRefreshData();
  };

  const handleSwitchToLocal = () => {
    if (window.confirm('Beralih ke penyimpanan lokal (offline)?')) {
      saveSupabaseConfig('', '');
      setSupabaseUrl('');
      setSupabaseKey('');
      onRefreshData();
      alert('Sistem kini berjalan dalam Mode Penyimpanan Lokal (Offline).');
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setUserActionMsg('');
    try {
      soundFx.playClick();
      await addUser(newUserForm);
      setUsersList(getAllUsers());
      setNewUserForm({
        username: '',
        password: '',
        name: '',
        role: 'mandor',
        assignedLokal: references.lokal[0] || 'Lokal 1'
      });
      soundFx.playSuccess();
      setUserActionMsg('Akun pengguna baru berhasil ditambahkan!');
      setTimeout(() => setUserActionMsg(''), 4000);
    } catch (err) {
      soundFx.playAlert();
      alert(err.message);
    }
  };

  const handleDeleteUserClick = (id, username) => {
    if (window.confirm(`Yakin ingin menghapus akun "${username}"?`)) {
      try {
        soundFx.playClick();
        deleteUser(id);
        setUsersList(getAllUsers());
        soundFx.playSuccess();
        setUserActionMsg(`Akun "${username}" berhasil dihapus.`);
        setTimeout(() => setUserActionMsg(''), 4000);
      } catch (err) {
        soundFx.playAlert();
        alert(err.message);
      }
    }
  };

  const sqlSchema = `-- SKEMA DATABASE SUPABASE UNTUK PT. SUKUN WARTONO INDONESIA
CREATE TABLE IF NOT EXISTS produksi (
  id BIGSERIAL PRIMARY KEY,
  "YEAR" INTEGER NOT NULL,
  "MONTH" VARCHAR(50) NOT NULL,
  "MONTH_NUMBER" INTEGER NOT NULL,
  "TANGGAL" DATE NOT NULL,
  "HARI" VARCHAR(50) DEFAULT '',
  "JAM_WIB" VARCHAR(50) DEFAULT '',
  "NAMA" VARCHAR(255) NOT NULL,
  "LOKAL" VARCHAR(100) NOT NULL,
  "ABSENSI" VARCHAR(50) DEFAULT 'Hadir',
  "GARAPAN" NUMERIC DEFAULT 0,
  "CW" NUMERIC DEFAULT 0,
  "PK" NUMERIC DEFAULT 0,
  "LK" NUMERIC DEFAULT 0,
  "TK" NUMERIC DEFAULT 0,
  "MT" NUMERIC DEFAULT 0,
  "MD" NUMERIC DEFAULT 0,
  "AT" NUMERIC DEFAULT 0,
  "MM" NUMERIC DEFAULT 0,
  "KERUSAKAN_TELAK" NUMERIC DEFAULT 0,
  "KERUSAKAN_MANDOR" NUMERIC DEFAULT 0,
  "KEKURANGAN_PAPIR" NUMERIC DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS referensi (
  id BIGSERIAL PRIMARY KEY,
  kategori VARCHAR(50) NOT NULL,
  nilai VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS log_aktivitas (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  aksi VARCHAR(50) NOT NULL,
  keterangan TEXT NOT NULL
);

ALTER TABLE produksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE referensi ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_aktivitas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Full Access on produksi" ON produksi FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access on referensi" ON referensi FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Full Access on log_aktivitas" ON log_aktivitas FOR ALL USING (true) WITH CHECK (true);`;

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlSchema);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleBackup = async () => {
    const backupObj = await backupAll();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `Backup_PT_Sukun_Wartono_Indonesia_QC_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchor.click();
  };

  const handleRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const json = JSON.parse(evt.target.result);
        const res = await restoreAll(json);
        if (res.success) {
          alert('Data berhasil dipulihkan dari cadangan.');
          onRefreshData();
        } else {
          alert('Gagal memulihkan data: ' + res.message);
        }
      } catch (err) {
        alert('File JSON tidak valid: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = async () => {
    const confirmed = window.confirm(
      '⚠️ PERINGATAN PENTING:\n\nApakah Anda yakin ingin MENGHAPUS SEMUA DATA PRODUKSI di database?\n\nSemua riwayat data produksi akan dikosongkan. Data akun pengguna dan master referensi tetap aman.\n\nLanjutkan?'
    );
    if (!confirmed) return;
    try {
      await clearAllProduksi();
      soundFx.playSuccess();
      alert('Seluruh data produksi berhasil dikosongkan dari database.');
      await onRefreshData();
    } catch (e) {
      alert('Gagal mengosongkan data: ' + e.message);
    }
  };

  const handleAddNama = (e) => {
    e.preventDefault();
    if (!newNama.trim()) return;
    onAddReference('NAMA_TELAK', newNama.trim());
    setNewNama('');
  };

  const handleAddLokal = (e) => {
    e.preventDefault();
    if (!newLokal.trim()) return;
    onAddReference('LOKAL', newLokal.trim());
    setNewLokal('');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* 1. MASTER RULE: MATRIKS HAK AKSES PERAN PENGGUNA (RBAC) */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>Master Rule: Matriks Peran & Hak Akses (Role-Based Access Control)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Aturan baku kewenangan sistem Quality Control <strong>PT. SUKUN WARTONO INDONESIA</strong> untuk Super Admin, Mandor QC, dan Operator.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(ROLE_PERMISSIONS).map(([roleKey, roleVal]) => (
            <div
              key={roleKey}
              className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-black text-sm text-slate-900 dark:text-white">
                    {roleVal.label}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border ${roleVal.badge}`}>
                    {roleKey}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {roleVal.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                  Modul yang Diizinkan:
                </span>
                <div className="flex flex-wrap gap-1">
                  {roleVal.allowedTabs.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. MASTER RULE: STANDAR BAKU MUTU QUALITY CONTROL */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-5">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-amber-500" />
            <span>Master Rule: Standar Baku Mutu & Parameter Toleransi Pabrik</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Parameter acuan kualitas fisik rokok PT. SUKUN WARTONO INDONESIA yang diterapkan pada kalkulasi otomatis sistem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {MASTER_QC_RULES.map((rule) => (
            <div
              key={rule.id}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex items-start space-x-3"
            >
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 shrink-0 mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                    {rule.nama}
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border shrink-0 ${rule.statusBadge}`}>
                    {rule.toleransi}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {rule.keterangan}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. MANAJEMEN AKUN PENGGUNA (KELOLA LOGIN MANDOR & ADMIN) */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span>Manajemen Akun Pengguna (Kelola Login)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Kelola kredensial akun para mandor QC dan staf yang memiliki akses masuk ke sistem.
            </p>
          </div>
          {userActionMsg && (
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-fadeIn">
              {userActionMsg}
            </span>
          )}
        </div>

        {/* Tabel Daftar Pengguna */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Username</th>
                <th className="p-3">Role / Peran</th>
                <th className="p-3">Wilayah Tugas</th>
                <th className="p-3">Password</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                    <span className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center text-[10px]">
                      {u.avatar || 'US'}
                    </span>
                    <span>{u.name}</span>
                  </td>
                  <td className="p-3 font-mono font-semibold text-slate-600 dark:text-slate-400">
                    {u.username}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${u.badgeColor}`}>
                      {u.roleLabel || u.role}
                    </span>
                  </td>
                  <td className="p-3">
                    {u.assignedLokal && u.assignedLokal !== 'ALL' ? (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                        📍 {u.assignedLokal}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                        🌐 Seluruh Pabrik
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-mono text-slate-500">
                    ••••••••
                  </td>
                  <td className="p-3 text-center">
                    {u.id !== 'usr-admin' ? (
                      <button
                        onClick={() => handleDeleteUserClick(u.id, u.username)}
                        title="Hapus Akun Pengguna"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">Utama</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Form Tambah User Baru */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center space-x-2 mb-3">
            <UserPlus className="w-4 h-4 text-emerald-500" />
            <span>Tambah Akun Baru (Mandor / Staf QC)</span>
          </h4>
          <form onSubmit={handleAddUserSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Nama Lengkap</label>
              <input
                type="text"
                required
                placeholder="Contoh: Mandor Wahyu"
                value={newUserForm.name}
                onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                className="w-full text-xs border rounded-xl px-3 py-2 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Username Login</label>
              <input
                type="text"
                required
                placeholder="Contoh: wahyu_qc"
                value={newUserForm.username}
                onChange={(e) => setNewUserForm({ ...newUserForm, username: e.target.value })}
                className="w-full text-xs border rounded-xl px-3 py-2 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Role / Peran</label>
              <select
                value={newUserForm.role}
                onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                className="w-full text-xs border rounded-xl px-3 py-2 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              >
                <option value="mandor">Mandor QC Lantai</option>
                <option value="operator">Operator / Viewer</option>
                <option value="admin">Super Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Wilayah / Lokal Tugas</label>
              <select
                value={newUserForm.assignedLokal || 'Lokal 1'}
                onChange={(e) => setNewUserForm({ ...newUserForm, assignedLokal: e.target.value })}
                className="w-full text-xs border rounded-xl px-3 py-2 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              >
                <option value="ALL">🌐 ALL (Seluruh Pabrik)</option>
                {references.lokal.map((l) => (
                  <option key={l} value={l}>📍 {l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Password</label>
              <div className="flex space-x-2">
                <input
                  type="password"
                  required
                  placeholder="Kata sandi"
                  value={newUserForm.password}
                  onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                  className="flex-1 text-xs border rounded-xl px-3 py-2 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors shrink-0"
                >
                  Simpan
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* 4. PENGATURAN DATABASE CLOUD SUPABASE */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Database className="w-5 h-5 text-amber-500" />
              <span>Pengaturan Database Cloud (Supabase PostgreSQL)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Data tersimpan aman di cloud <strong>Supabase (PostgreSQL)</strong> dan otomatis tersinkronisasi antar perangkat.
            </p>
          </div>
          <button
            onClick={handleSwitchToLocal}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors shrink-0"
          >
            Gunakan Mode Offline (Lokal)
          </button>
        </div>

        {/* Form Supabase */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Supabase Project URL
            </label>
            <input
              type="text"
              placeholder="https://your-project-id.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="w-full text-xs font-mono border rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Supabase Anon Public API Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="w-full text-xs font-mono border rounded-xl px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
            />
          </div>

          {testResult && (
            <div
              className={`p-3.5 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800'
              }`}
            >
              <span>{testResult.success ? '✓' : '✗'}</span>
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white dark:bg-slate-800 font-bold text-xs hover:bg-slate-800 transition-colors flex items-center space-x-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Menguji Koneksi...' : 'Uji Koneksi Cloud'}</span>
            </button>
            <button
              onClick={handleSaveConfig}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition-colors"
            >
              Simpan Konfigurasi
            </button>
          </div>
        </div>

        {/* Skema SQL Card */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Skema Tabel Database Supabase (SQL Query)
            </span>
            <button
              onClick={copySqlToClipboard}
              className="text-xs text-amber-600 dark:text-amber-400 font-semibold flex items-center space-x-1"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Tersalin ke Clipboard!' : 'Salin Kode SQL'}</span>
            </button>
          </div>
          <pre className="bg-slate-950 text-slate-200 p-4 rounded-xl text-[11px] font-mono overflow-x-auto max-h-40">
            {sqlSchema}
          </pre>
        </div>
      </div>

      {/* 5. KELOLA MASTER REFERENSI (NAMA TELAK & LOKAL) */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Kelola Master Referensi (Autocomplete Dropdown)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Master Nama Telak */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Daftar Nama Telak (Operator Giling)
            </h4>
            <form onSubmit={handleAddNama} className="flex space-x-2">
              <input
                type="text"
                placeholder="Tambah nama telak baru..."
                value={newNama}
                onChange={(e) => setNewNama(e.target.value)}
                className="flex-1 text-xs border rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              {references.namaTelak.map((n) => (
                <span
                  key={n}
                  className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                >
                  <span className="truncate max-w-[140px]">{n}</span>
                  <button
                    onClick={() => onDeleteReference('NAMA_TELAK', n)}
                    className="ml-1.5 text-slate-400 hover:text-red-500"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Master Lokal */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Daftar Lokal Produksi
            </h4>
            <form onSubmit={handleAddLokal} className="flex space-x-2">
              <input
                type="text"
                placeholder="Tambah lokal baru..."
                value={newLokal}
                onChange={(e) => setNewLokal(e.target.value)}
                className="flex-1 text-xs border rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              />
              <button
                type="submit"
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
            <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              {references.lokal.map((l) => (
                <span
                  key={l}
                  className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                >
                  <span className="truncate max-w-[140px]">{l}</span>
                  <button
                    onClick={() => onDeleteReference('LOKAL', l)}
                    className="ml-1.5 text-slate-400 hover:text-red-500"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6. CADANGAN & PULIHKAN DATA (BACKUP & RESTORE) */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <HardDrive className="w-5 h-5 text-emerald-500" />
          <span>Cadangan &amp; Pulihkan Data (JSON Backup)</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Unduh seluruh data produksi, master referensi, dan log aktivitas sebagai file JSON lokal untuk antisipasi darurat.
        </p>

        <div className="flex flex-wrap items-center gap-4 pt-2">
          <button
            onClick={handleBackup}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center space-x-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Unduh Cadangan (Backup JSON)</span>
          </button>

          <label className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs shadow-sm flex items-center space-x-2 cursor-pointer transition-colors">
            <Upload className="w-4 h-4" />
            <span>Pulihkan Data (Restore JSON)</span>
            <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
          </label>
        </div>
      </div>

      {/* 7. RESET / KOSONGKAN DATA PRODUKSI (ZONA PENGUJIAN) */}
      <div className="bg-red-50/50 dark:bg-red-950/20 p-6 sm:p-8 rounded-2xl border border-red-200 dark:border-red-900/40 space-y-3">
        <h3 className="text-base font-bold text-red-900 dark:text-red-200 flex items-center space-x-2">
          <Trash2 className="w-5 h-5 text-red-600" />
          <span>Reset / Kosongkan Data Produksi</span>
        </h3>
        <p className="text-xs text-red-700 dark:text-red-400">
          Gunakan fungsi ini jika Anda ingin menghapus seluruh data produksi hasil trial / pengujian agar database bersih kembali sebelum mengimpor data riil yang sebenarnya. Akun pengguna dan master referensi tetap aman.
        </p>
        <button
          type="button"
          onClick={handleClearAllData}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-sm flex items-center space-x-2 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          <span>Kosongkan Seluruh Data Produksi Sekarang</span>
        </button>
      </div>

      {/* 8. LOG AKTIVITAS AUDIT */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <History className="w-5 h-5 text-slate-500" />
          <span>Riwayat Log Aktivitas Sistem</span>
        </h3>

        <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {logs && logs.length > 0 ? (
            logs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 mr-2">
                    [{log.aksi}]
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">{log.keterangan}</span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString('id-ID')}
                </span>
              </div>
            ))
          ) : (
            <p className="text-slate-400 italic py-4">Belum ada riwayat aktivitas.</p>
          )}
        </div>
      </div>
    </div>
  );
}
