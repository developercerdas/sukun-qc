import React, { useState } from 'react';
import {
  Menu,
  RotateCw,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Clock,
  LogOut
} from 'lucide-react';
import { soundFx } from '../utils/soundHelper';
import { useLiveWIB } from '../utils/dateHelper';

const PAGE_META = {
  dashboard: { title: 'Dashboard Mutu & KPI', desc: 'Pemantauan indikator kinerja mutu pabrik' },
  input: { title: 'Input Tally QC Meja', desc: 'Pencatatan langsung cacat fisik batang rokok' },
  import: { title: 'Import Data Excel', desc: 'Unggah file Excel (.xlsx / .csv) ke database' },
  produksi: { title: 'Data Produksi & Kartu Giling', desc: 'Tabel arsip inspeksi dan cetak slip meja' },
  anatomi: { title: 'Anatomi 8 Cacat Rokok', desc: 'Titik inspeksi fisik, dampak kerugian & mitigasi' },
  analisis: { title: 'Peringkat Operator & Sektor', desc: 'Leaderboard mutu operator giling dan lokal' },
  laporan: { title: 'Pusat Cetak Laporan Resmi', desc: 'Format laporan formal PT. SUKUN WARTONO INDONESIA siap cetak / PDF' },
  audit: { title: 'Audit Integritas Data', desc: 'Pengecekan anomali, duplikasi, dan akurasi dataset' },
  pengaturan: { title: 'Konfigurasi Database & Deploy', desc: 'Koneksi Supabase Cloud, Backup & GitHub Pages' }
};

export default function ModernHeader({
  activeTab,
  onOpenMobileSidebar,
  darkMode,
  setDarkMode,
  isSupabaseConnected,
  isRefreshing,
  onRefresh,
  currentUser,
  onLogout
}) {
  const [soundEnabled, setSoundEnabled] = useState(soundFx.enabled);
  const liveWIB = useLiveWIB();

  const toggleSound = () => {
    soundFx.enabled = !soundEnabled;
    setSoundEnabled(!soundEnabled);
    if (!soundEnabled) soundFx.playClick();
  };

  const meta = PAGE_META[activeTab] || { title: 'Quality Control', desc: 'Sistem QC PT. SUKUN WARTONO INDONESIA' };

  return (
    <header className="sticky top-0 z-30 bg-white/85 dark:bg-slate-900/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between gap-4 transition-colors">
      {/* Left: Mobile trigger & Page breadcrumb */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-black dark:hover:text-white"
          title="Buka Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
            {meta.title}
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
            {meta.desc}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2 sm:space-x-2.5 text-xs">
        {/* Live Hari, Tanggal, Jam WIB Clock Widget */}
        <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-2xl bg-slate-900 text-white dark:bg-slate-800 border border-slate-700/80 shadow-xs">
          <Clock className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
          <span className="font-mono font-bold text-[11px] text-emerald-300 tracking-wide whitespace-nowrap">
            {liveWIB}
          </span>
        </div>

        {/* Database Status Indicator */}
        <div
          className={`hidden md:inline-flex items-center px-3 py-1.5 rounded-xl font-bold border ${
            isSupabaseConnected
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
          }`}
          title={isSupabaseConnected ? 'Terhubung ke Database Cloud Supabase' : 'Mode Penyimpanan Lokal (Offline Ready)'}
        >
          <span
            className={`w-2 h-2 mr-2 rounded-full ${
              isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'
            }`}
          />
          <span>{isSupabaseConnected ? 'Cloud Supabase' : 'Lokal (Offline)'}</span>
        </div>

        {/* Sound Feedback Toggle */}
        <button
          onClick={toggleSound}
          title={soundEnabled ? 'Matikan Suara Audio Tally' : 'Aktifkan Suara Audio Tally'}
          className={`p-2 rounded-xl border transition-colors ${
            soundEnabled
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-700 dark:hover:text-white'
          }`}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Refresh Data Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Segarkan Data"
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 disabled:opacity-50"
        >
          <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Role Pill & Logout */}
        {currentUser && (
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="hidden sm:flex flex-col text-right">
              <span className="font-bold text-slate-800 dark:text-slate-100 text-[11px] leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                {currentUser.roleLabel}
              </span>
            </div>
            <button
              onClick={onLogout}
              title={`Keluar (${currentUser.name})`}
              className="p-2 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 border border-slate-200 dark:border-slate-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
