import React from 'react';
import { Menu, RotateCw, Moon, Sun, Database, CloudCheck, HardDrive } from 'lucide-react';

const PAGE_TITLES = {
  dashboard: 'Dashboard Utama & KPI',
  input: 'Input Data Harian',
  produksi: 'Tabel Data Produksi & Kerusakan',
  kerusakan: 'Analisis Rincian Kerusakan',
  analisis: 'Analisis & Peringkat Perbaikan',
  laporan: 'Pusat Laporan & Ekspor',
  audit: 'Audit Kualitas Data Otomatis',
  pengaturan: 'Pengaturan & Koneksi Database'
};

export default function Header({
  activeTab,
  periodLabel,
  isSupabaseConnected,
  isRefreshing,
  onRefresh,
  darkMode,
  setDarkMode,
  onToggleSidebar
}) {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 flex items-center justify-between px-6 z-20 shadow-xs transition-colors shrink-0">
      {/* Left Title */}
      <div className="flex items-center space-x-4">
        <button
          onClick={onToggleSidebar}
          className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
            {PAGE_TITLES[activeTab] || 'Sistem QC'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Periode Analisis: <span className="font-semibold text-amber-600 dark:text-amber-400">{periodLabel || 'Semua Periode'}</span>
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Database Status Indicator */}
        <div
          className={`hidden sm:inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            isSupabaseConnected
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
          }`}
          title={isSupabaseConnected ? 'Terhubung ke Database Cloud Supabase' : 'Beroperasi dalam Mode Penyimpanan Lokal (Offline Ready)'}
        >
          <span
            className={`w-2 h-2 mr-2 rounded-full ${
              isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-blue-500'
            }`}
          />
          {isSupabaseConnected ? 'Supabase Cloud' : 'Penyimpanan Lokal'}
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Segarkan Data"
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 disabled:opacity-50"
        >
          <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-600' : ''}`} />
        </button>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
}
