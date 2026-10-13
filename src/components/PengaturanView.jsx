import React, { useState, useEffect } from 'react';
import {
  Database,
  Cloud,
  Check,
  Copy,
  Server,
  RefreshCw,
  Plus,
  Trash2,
  HardDrive,
  Download,
  Upload,
  History,
  GitBranch,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection
} from '../services/supabaseClient';
import { backupAll, restoreAll } from '../services/storage';

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

  const handleSaveConfig = async () => {
    saveSupabaseConfig(supabaseUrl, supabaseKey);
    alert('Konfigurasi database berhasil disimpan!');
    await onRefreshData();
  };

  const handleSwitchToLocal = async () => {
    if (
      window.confirm(
        'Beralih ke mode penyimpanan lokal? Aplikasi akan menggunakan database browser komputer ini.'
      )
    ) {
      saveSupabaseConfig('', '');
      setSupabaseUrl('');
      setSupabaseKey('');
      setTestResult(null);
      await onRefreshData();
      alert('Sistem kini berjalan dalam Mode Penyimpanan Lokal (Offline).');
    }
  };

  const sqlSchema = `-- SKEMA DATABASE SUPABASE UNTUK PT SUKUN QUALITY CONTROL
CREATE TABLE IF NOT EXISTS produksi (
  id BIGSERIAL PRIMARY KEY,
  "YEAR" INTEGER NOT NULL,
  "MONTH" VARCHAR(50) NOT NULL,
  "MONTH_NUMBER" INTEGER NOT NULL,
  "TANGGAL" DATE NOT NULL,
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

ALTER TABLE produksi ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public Full Access" ON produksi FOR ALL USING (true) WITH CHECK (true);`;

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
    dlAnchor.setAttribute('download', `Backup_Sukun_QC_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchor.click();
  };

  const handleRestore = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target.result);
        await restoreAll(json);
        alert('Data berhasil dipulihkan dari cadangan!');
        await onRefreshData();
      } catch (err) {
        alert('Gagal memulihkan file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleAddNama = async (e) => {
    e.preventDefault();
    if (!newNama.trim()) return;
    await onAddReference('NAMA_TELAK', newNama.trim());
    setNewNama('');
  };

  const handleAddLokal = async (e) => {
    e.preventDefault();
    if (!newLokal.trim()) return;
    await onAddReference('LOKAL', newLokal.trim());
    setNewLokal('');
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* 1. Pengaturan Database Cloud Supabase */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Database className="w-5 h-5 text-amber-500" />
              <span>Pengaturan Koneksi Database (Supabase Cloud vs Lokal)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Rekomendasi terbaik: Gunakan <strong>Supabase (PostgreSQL Cloud Gratis)</strong> agar data tersimpan aman di cloud dan bisa diakses bersama dari HP maupun laptop.
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
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              <span>{testResult.success ? '✓' : '✗'}</span>
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-2 transition-colors disabled:opacity-50"
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
          <p className="text-[11px] text-slate-500 mt-2">
            💡 <em>Cara pakai:</em> Buka dashboard Supabase Anda &gt; menu <strong>SQL Editor</strong> &gt; tempel (paste) kode di atas lalu klik <strong>Run</strong>.
          </p>
        </div>
      </div>

      {/* 2. Panduan Deploy ke GitHub (100% Gratis & Selamanya Aktif) */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <GitBranch className="w-5 h-5 text-purple-500" />
          <span>Panduan Deploy Aplikasi ke GitHub & GitHub Pages</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Aplikasi ini telah dirancang 100% kompatibel dengan <strong>GitHub Pages</strong>. Ikuti langkah sederhana berikut untuk mempublikasikan aplikasi:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
              1
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">Buat Repo di GitHub</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Buka <a href="https://github.com/new" target="_blank" rel="noreferrer" className="text-amber-600 underline">github.com/new</a>, buat repository baru bernama <strong>sukun-qc</strong> (Public).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
              2
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">Push Kode dari Laptop</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Jalankan perintah Git di folder <code>D:\APLIKASI\QC</code>:
              <br />
              <code>git remote add origin &lt;URL-REPO&gt;</code>
              <br />
              <code>git push -u origin main</code>
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center">
              3
            </div>
            <h4 className="font-bold text-xs text-slate-900 dark:text-white">Aktivasi GitHub Pages</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Di GitHub &gt; <strong>Settings &gt; Pages</strong> &gt; Source: pilih <strong>GitHub Actions</strong>. Aplikasi otomatis ter-deploy online!
            </p>
          </div>
        </div>
      </div>

      {/* 3. Kelola Master Referensi (Nama Telak & Lokal) */}
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
                placeholder="Tambah nama lokal baru..."
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

      {/* 4. Cadangan & Pemulihan (Backup & Restore) */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
            <HardDrive className="w-4 h-4 text-emerald-500" />
            <span>Cadangan & Pemulihan Data (JSON Backup)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Unduh seluruh database ke file JSON di laptop Anda untuk arsip offline atau pindah komputer.
          </p>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleBackup}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs flex items-center space-x-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Cadangan</span>
          </button>
          <label className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center space-x-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Pulihkan</span>
            <input type="file" accept=".json" onChange={handleRestore} className="hidden" />
          </label>
        </div>
      </div>

      {/* 5. Log Aktivitas Sistem (Audit Trail) */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
          <History className="w-4 h-4 text-slate-400" />
          <span>Log Riwayat Aktivitas QC (Audit Trail)</span>
        </h3>
        <div className="overflow-x-auto max-h-56">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase border-b font-semibold">
                <th className="p-2.5">Waktu</th>
                <th className="p-2.5">Aksi</th>
                <th className="p-2.5">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {logs.map((lg) => (
                <tr key={lg.id || lg.timestamp}>
                  <td className="p-2.5 whitespace-nowrap text-slate-500 font-mono text-[11px]">
                    {new Date(lg.timestamp).toLocaleString('id-ID')}
                  </td>
                  <td className="p-2.5 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {lg.aksi}
                    </span>
                  </td>
                  <td className="p-2.5">{lg.keterangan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
